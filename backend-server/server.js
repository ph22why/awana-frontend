require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3100', 'http://localhost:3101', 'https://awanaevent.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MySQL 설정 (성능 최적화)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tntcamp',
  charset: 'utf8mb4',
  acquireTimeout: 10000,   // 10초로 단축
  timeout: 10000,          // 10초로 단축
  reconnect: true,
  connectionLimit: 20,     // 커넥션 풀 크기 증가
  idleTimeout: 300000,     // 5분
  queueLimit: 0
};

let db;
function handleDisconnect() {
  db = mysql.createPool(dbConfig);

  db.on('connection', (connection) => {
    console.log('✅ MySQL Connected');
  });

  db.on('error', (err) => {
    console.error('❌ MySQL error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    }
  });
}

handleDisconnect();

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check request received');
  res.status(200).json({ status: 'OK', message: 'TNT Camp Backend is running' });
});

// Initialize database tables for session attendance
app.post('/init-session-attendance', (req, res) => {
  console.log('🔧 Initializing session attendance table...');
  
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS session_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      user_id INT NOT NULL,
      user_type VARCHAR(50) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      attended_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session_user (session_id, user_id, user_type),
      INDEX idx_session_id (session_id),
      INDEX idx_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('❌ Error creating session_attendance table:', err);
      res.status(500).json({ error: 'Error creating table', details: err.message });
    } else {
      console.log('✅ Session attendance table initialized successfully');
      
      // Add student_id column to students table if it doesn't exist
      const addStudentIdSql = `
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) UNIQUE,
        ADD COLUMN IF NOT EXISTS studentGroup VARCHAR(50),
        ADD COLUMN IF NOT EXISTS team INT
      `;
      
      db.query(addStudentIdSql, (err2, result2) => {
        if (err2 && !err2.message.includes('Duplicate column name')) {
          console.error('⚠️ Warning: Could not add student_id column:', err2.message);
        }
        
        // Update existing students with auto-generated student IDs if they don't have one
        const updateStudentIdSql = `
          UPDATE students 
          SET 
            student_id = CONCAT('STU', LPAD(id, 4, '0')),
            studentGroup = CASE 
              WHEN id % 7 = 1 THEN 'KNOW'
              WHEN id % 7 = 2 THEN 'LOVE' 
              WHEN id % 7 = 3 THEN 'SERVE'
              WHEN id % 7 = 4 THEN 'GLORY'
              WHEN id % 7 = 5 THEN 'HOLY'
              WHEN id % 7 = 6 THEN 'GRACE'
              ELSE 'HOPE'
            END,
            team = ((id - 1) % 5) + 1
          WHERE student_id IS NULL OR student_id = ''
        `;
        
        db.query(updateStudentIdSql, (err3, result3) => {
          if (err3) {
            console.error('⚠️ Warning: Could not update student IDs:', err3.message);
          } else {
            console.log(`✅ Updated ${result3.changedRows} students with auto-generated IDs`);
          }
          
          res.status(200).json({ 
            message: 'Session attendance system initialized successfully',
            tablesCreated: true,
            studentsUpdated: result3 ? result3.changedRows : 0
          });
        });
      });
    }
  });
});

// Test endpoint
app.post('/test-check', (req, res) => {
  console.log('🧪 Test check request received:', req.body);
  res.status(200).json({ message: 'Test successful', data: req.body });
});

// Student Registration
app.post('/register/student', (req, res) => {
  console.log('📝 Received request to register student:', req.body);
  const { koreanName, englishName, churchName, churchNumber, parentContact, healthNotes, shirtSize, gender, image } = req.body;

  // Convert Korean gender to English
  const genderEn = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;

  const sql = `INSERT INTO students (koreanName, englishName, churchName, churchNumber, parentContact, healthNotes, shirtSize, gender, image)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [koreanName, englishName, churchName, churchNumber, parentContact, healthNotes, shirtSize, genderEn, image], (err, result) => {
    if (err) {
      console.error('Error inserting student data:', err);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
      return;
    }

    const userId = result.insertId;
    console.log('✅ Student registered with ID:', userId);

    // QR 코드 생성 (프로덕션 환경용)
    const qrUrl = `https://awanaevent.com/tntcamp/qr-pin?userId=${userId}`;
    QRCode.toDataURL(qrUrl, (err, url) => {
      if (err) {
        console.error('Error generating QR code:', err);
        return res.status(500).json({ error: 'Error generating QR code' });
      }

      const updateSql = 'UPDATE students SET qrCode = ? WHERE id = ?';
      db.query(updateSql, [url, userId], (err, updateResult) => {
        if (err) {
          console.error('Error updating user with QR code:', err);
          return res.status(500).json({ error: 'Error updating user with QR code' });
        }
        res.status(200).json({ id: userId, qrCode: url });
      });
    });       
  });
});

// Youth Ministry Registration
app.post('/register/ym', (req, res) => {
  console.log('📝 Received request to register YM:', req.body);
  const { name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize } = req.body;

  // Convert Korean gender to English
  const genderEn = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;

  // Use correct column names matching database schema
  const sql = `INSERT INTO ym (name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, englishName, churchName, churchNumber, genderEn, awanaRole, position, contact, shirtSize], (err, result) => {
    if (err) {
      console.error('Error inserting YM data:', err);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
    } else {
      const ymId = result.insertId;
      console.log('✅ YM registered with ID:', ymId);

      // QR 코드 생성 (YM용)
      const qrUrl = `https://awanaevent.com/tntcamp/qr-pin?ymId=${ymId}&type=ym`;
      QRCode.toDataURL(qrUrl, (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).json({ error: 'Error generating QR code' });
        }

        const updateSql = 'UPDATE ym SET qrCode = ? WHERE id = ?';
        db.query(updateSql, [url, ymId], (err, updateResult) => {
          if (err) {
            console.error('Error updating YM with QR code:', err);
            return res.status(500).json({ error: 'Error updating YM with QR code' });
          }
          res.status(200).json({ id: ymId, qrCode: url });
        });
      });
    }
  });
});

// Teacher Registration
app.post('/register/teacher', (req, res) => {
  console.log('📝 Received request to register Teacher:', req.body);
  const { name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize } = req.body;
  
  // 필수 필드 검증
  if (!name || !churchName || !gender || !contact) {
    console.error('❌ Missing required fields:', { name, churchName, gender, contact });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Convert Korean gender to English
  const genderEn = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;

  const sql = `INSERT INTO teachers (name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  console.log('🔍 Executing teacher insert with params:', [name, englishName, churchName, churchNumber, genderEn, awanaRole, position, contact, shirtSize]);
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderEn, awanaRole, position, contact, shirtSize], (err, result) => {
    if (err) {
      console.error('❌ Error inserting teacher data:', err);
      console.error('❌ SQL:', sql);
      console.error('❌ Params:', [name, englishName, churchName, churchNumber, genderEn, awanaRole, position, contact, shirtSize]);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
    } else {
      const teacherId = result.insertId;
      console.log('✅ Teacher registered with ID:', teacherId);

      // QR 코드 생성 (Teacher용)
      const qrUrl = `https://awanaevent.com/tntcamp/qr-pin?teacherId=${teacherId}&type=teacher`;
      QRCode.toDataURL(qrUrl, (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).json({ error: 'Error generating QR code' });
        }

        const updateSql = 'UPDATE teachers SET qrCode = ? WHERE id = ?';
        db.query(updateSql, [url, teacherId], (err, updateResult) => {
          if (err) {
            console.error('Error updating teacher with QR code:', err);
            return res.status(500).json({ error: 'Error updating teacher with QR code' });
          }
          res.status(200).json({ id: teacherId, qrCode: url });
        });
      });
    }
  });
});

// Staff Registration
app.post('/register/staff', (req, res) => {
  console.log('📝 Received request to register Staff:', req.body);
  const { name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize } = req.body;

  // Convert Korean gender to English
  const genderEn = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;

  const sql = `INSERT INTO staff (name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, englishName, churchName, churchNumber, genderEn, awanaRole, position, contact, shirtSize], (err, result) => {
    if (err) {
      console.error('Error inserting staff data:', err);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
    } else {
      const staffId = result.insertId;
      console.log('✅ Staff registered with ID:', staffId);

      // QR 코드 생성 (Staff용)
      const qrUrl = `https://awanaevent.com/tntcamp/qr-pin?staffId=${staffId}&type=staff`;
      QRCode.toDataURL(qrUrl, (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).json({ error: 'Error generating QR code' });
        }

        const updateSql = 'UPDATE staff SET qrCode = ? WHERE id = ?';
        db.query(updateSql, [url, staffId], (err, updateResult) => {
          if (err) {
            console.error('Error updating staff with QR code:', err);
            return res.status(500).json({ error: 'Error updating staff with QR code' });
          }
          res.status(200).json({ id: staffId, qrCode: url });
        });
      });
    }
  });
});

// Church Registration
app.post('/register/church', (req, res) => {
  console.log('📝 Received request to register Church:', req.body);
  const { churchName, name, contact, churchNumber } = req.body;

  // 먼저 교회번호가 이미 존재하는지 확인
  const checkSql = 'SELECT * FROM church WHERE churchNumber = ?';
  
  db.query(checkSql, [churchNumber], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('❌ Error checking existing church:', checkErr);
      res.status(500).json({ error: 'Error checking existing church', details: checkErr.message });
      return;
    }

    if (checkResult.length > 0) {
      // 이미 존재하는 교회 - 기존 데이터 반환
      console.log('✅ Church already exists, returning existing data:', checkResult[0]);
      res.status(200).json({ 
        id: checkResult[0].id, 
        message: 'Church already registered',
        existing: true,
        church: checkResult[0]
      });
      return;
    }

    // 새로운 교회 등록
    const insertSql = `INSERT INTO church (churchName, name, contact, churchNumber)
               VALUES (?, ?, ?, ?)`;

    console.log('🔍 Executing church insert with params:', [churchName, name, contact, churchNumber]);

    db.query(insertSql, [churchName, name, contact, churchNumber], (err, result) => {
    if (err) {
        console.error('❌ Error inserting church data:', err);
        console.error('❌ SQL:', insertSql);
        console.error('❌ Params:', [churchName, name, contact, churchNumber]);
        res.status(500).json({ error: 'Error inserting data', details: err.message });
    } else {
      console.log('✅ Church registered with ID:', result.insertId);
        res.status(200).json({ 
          id: result.insertId, 
          message: 'Church registered successfully',
          existing: false 
        });
    }
    });
  });
});

// Check User
app.post('/checkUser', (req, res) => {
  console.log('🔍 checkUser request received:', req.body);
  const { name, parentContact, userType } = req.body;
  
  let sql, tableName;
  
  switch (userType) {
    case 'teacher':
      sql = 'SELECT id FROM teachers WHERE name = ? AND contact = ?';
      tableName = 'teachers';
      break;
    case 'staff':
      sql = 'SELECT id FROM staff WHERE name = ? AND contact = ?';
      tableName = 'staff';
      break;
    case 'ym':
      sql = 'SELECT id FROM ym WHERE name = ? AND contact = ?';
      tableName = 'ym';
      break;
    default: // student
      sql = 'SELECT id FROM students WHERE koreanName = ? AND parentContact = ?';
      tableName = 'students';
  }
  
  console.log(`🔍 Executing SQL: ${sql}`);
  console.log(`🔍 With params:`, [name, parentContact]);
  console.log(`🔍 Name length: ${name.length}, Contact length: ${parentContact.length}`);
  console.log(`🔍 Name bytes:`, Buffer.from(name, 'utf8'));
  
  db.query(sql, [name, parentContact], (err, result) => {
    if (err) {
      console.error('❌ Error checking user data:', err);
      res.status(500).json({ error: 'Error checking user data' });
    } else {
      console.log(`🔍 Query executed successfully. Result count: ${result.length}`);
      if (result.length > 0) {
        console.log('✅ User found:', result[0]);
        res.status(200).json({ ...result[0], tableName });
      } else {
        console.log('❌ No user found');
        // 디버깅을 위해 비슷한 데이터 조회
        let debugSql;
        if (tableName === 'students') {
          debugSql = `SELECT koreanName, parentContact FROM ${tableName} LIMIT 5`;
        } else {
          debugSql = `SELECT name, contact FROM ${tableName} LIMIT 5`;
        }
        db.query(debugSql, [], (debugErr, debugResult) => {
          if (!debugErr) {
            console.log('🔍 Available data in table:', debugResult);
          }
        });
        res.status(200).json({});
      }
    }
  });
});

// Check Church
app.post('/checkchurch', (req, res) => {
  const { churchNumber, contact } = req.body;
  console.log('🔍 Church lookup request:', { churchNumber, contact });
  
  // 교회 정보 조회
  const churchSql = 'SELECT * FROM church WHERE churchNumber = ?';
  
  db.query(churchSql, [churchNumber], (err, churchResult) => {
    if (err) {
      console.error('Error checking church data:', err);
      res.status(500).json({ error: 'Error checking church data' });
      return;
    }
    
    if (churchResult.length === 0) {
      console.log('❌ Church not found');
      res.status(200).json({});
      return;
    }
    
    const church = churchResult[0];
    console.log('✅ Church found:', church);
    
    // 담당자 연락처 확인 (제공된 경우)
    if (contact && church.contact !== contact) {
      console.log('❌ Contact mismatch');
      res.status(200).json({});
      return;
    }
    
    // 해당 교회의 모든 사용자 조회
    const promises = [
      // Students
      new Promise((resolve, reject) => {
        db.query('SELECT * FROM students WHERE churchNumber = ?', [churchNumber], (err, result) => {
          if (err) reject(err);
          else resolve(result || []);
        });
      }),
      // YM
      new Promise((resolve, reject) => {
        db.query('SELECT * FROM ym WHERE churchNumber = ?', [churchNumber], (err, result) => {
          if (err) reject(err);
          else resolve(result || []);
        });
      }),
      // Staff
      new Promise((resolve, reject) => {
        db.query('SELECT * FROM staff WHERE churchNumber = ?', [churchNumber], (err, result) => {
          if (err) reject(err);
          else resolve(result || []);
        });
      }),
      // Teachers
      new Promise((resolve, reject) => {
        db.query('SELECT * FROM teachers WHERE churchNumber = ?', [churchNumber], (err, result) => {
          if (err) reject(err);
          else resolve(result || []);
        });
      })
    ];
    
    Promise.all(promises)
      .then(([students, ym, staff, teachers]) => {
        console.log('✅ Church data compiled:', {
          church: church.churchName,
          students: students.length,
          ym: ym.length,
          staff: staff.length,
          teachers: teachers.length
        });
        
        res.status(200).json({
          ...church,
          students,
          ym,
          staff,
          teachers
        });
      })
      .catch(error => {
        console.error('Error fetching church users:', error);
        res.status(500).json({ error: 'Error fetching church users' });
      });
  });
});

// Get User by ID
app.get('/user/:id', (req, res) => {
  const sql = 'SELECT * FROM students WHERE id = ?';
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(result);
    }
  });
});

// Get Staff/YM by ID
app.get('/staff/:id', (req, res) => {
  const sql = 'SELECT * FROM staff WHERE id = ?';
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching staff data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      console.log('✅ Staff data fetched:', result);
      res.status(200).json(result.length > 0 ? result[0] : null);
    }
  });
});

app.get('/ym/:id', (req, res) => {
  const sql = 'SELECT * FROM ym WHERE id = ?';
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching YM data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      console.log('✅ YM data fetched:', result);
      res.status(200).json(result.length > 0 ? result[0] : null);
    }
  });
});

app.get('/teacher/:id', (req, res) => {
  const sql = 'SELECT * FROM teachers WHERE id = ?';
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching teacher data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      console.log('✅ Teacher data fetched:', result);
      res.status(200).json(result.length > 0 ? result[0] : null);
    }
  });
});

// Update User Data
app.put('/user/:id', (req, res) => {
  const { koreanName, englishName, churchName, churchNumber, parentContact, healthNotes, shirtSize, gender, image } = req.body;
  const genderEn = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;
  const sql = `UPDATE students SET koreanName=?, englishName=?, churchName=?, churchNumber=?, parentContact=?, healthNotes=?, shirtSize=?, gender=?, image=? WHERE id=?`;
  
  db.query(sql, [koreanName, englishName, churchName, churchNumber, parentContact, healthNotes, shirtSize, genderEn, image, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating user data:', err);
      res.status(500).json({ error: 'Error updating data' });
    } else {
      res.status(200).json({ message: 'User updated successfully' });
    }
  });
});

// Update Staff/YM Data
app.put('/staff/:id', (req, res) => {
  const { name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize } = req.body;
  const genderForDB = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;
  
  const sql = `UPDATE staff SET name=?, englishName=?, churchName=?, churchNumber=?, gender=?, awanaRole=?, position=?, contact=?, shirtSize=? WHERE id=?`;
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderForDB, awanaRole, position, contact, shirtSize, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating staff data:', err);
      res.status(500).json({ error: 'Error updating data' });
    } else {
      // 업데이트된 데이터를 다시 조회해서 반환
      db.query('SELECT * FROM staff WHERE id = ?', [req.params.id], (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Error fetching updated staff data:', selectErr);
          res.status(500).json({ error: 'Error fetching updated data' });
        } else {
          res.status(200).json(selectResult[0]);
        }
      });
    }
  });
});

app.put('/ym/:id', (req, res) => {
  const { name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize } = req.body;
  const genderForDB = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;
  
  // Use correct column names matching database schema
  const sql = `UPDATE ym SET name=?, englishName=?, churchName=?, churchNumber=?, gender=?, awanaRole=?, position=?, contact=?, shirtSize=? WHERE id=?`;
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderForDB, awanaRole, position, contact, shirtSize, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating YM data:', err);
      res.status(500).json({ error: 'Error updating data' });
    } else {
      // 업데이트된 데이터를 다시 조회해서 반환
      db.query('SELECT * FROM ym WHERE id = ?', [req.params.id], (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Error fetching updated YM data:', selectErr);
          res.status(500).json({ error: 'Error fetching updated data' });
        } else {
          res.status(200).json(selectResult[0]);
        }
      });
    }
  });
});

app.put('/teacher/:id', (req, res) => {
  const { name, englishName, churchName, churchNumber, gender, awanaRole, position, contact, shirtSize } = req.body;
  const genderForDB = gender === '남자' ? 'male' : gender === '여자' ? 'female' : gender;
  
  const sql = `UPDATE teachers SET name=?, englishName=?, churchName=?, churchNumber=?, gender=?, awanaRole=?, position=?, contact=?, shirtSize=? WHERE id=?`;
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderForDB, awanaRole, position, contact, shirtSize, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating teacher data:', err);
      res.status(500).json({ error: 'Error updating data' });
    } else {
      // 업데이트된 데이터를 다시 조회해서 반환
      db.query('SELECT * FROM teachers WHERE id = ?', [req.params.id], (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Error fetching updated teacher data:', selectErr);
          res.status(500).json({ error: 'Error fetching updated data' });
        } else {
          res.status(200).json(selectResult[0]);
        }
      });
    }
  });
});

// Update Level
app.post('/update-level', (req, res) => {
  const { userId, level } = req.body;
  const sql = 'UPDATE students SET level = ? WHERE id = ?';

  db.query(sql, [level, userId], (err, result) => {
    if (err) {
      console.error('Error updating level:', err);
      res.status(500).json({ error: 'Error updating level' });
      return;
    }
    res.status(200).json({ message: 'Level updated successfully' });
  });
});

// Admin endpoints
app.get('/admin/:type', (req, res) => {
  const type = req.params.type;
  // Parse page and limit as numbers
  let { search, page = 1, limit = 50 } = req.query;
  page = page === undefined ? 1 : Number(page);
  limit = limit === undefined || limit === 'all' ? limit : Number(limit);

  let baseSql = `FROM ${type}`;
  let whereSql = '';
  let params = [];

  if (search) {
    if (type === 'students') {
      whereSql = ` WHERE koreanName LIKE ? OR englishName LIKE ? OR churchName LIKE ?`;
    } else {
      whereSql = ` WHERE name LIKE ? OR englishName LIKE ? OR churchName LIKE ?`;
    }
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  // 1. 전체 개수 쿼리
  const countSql = `SELECT COUNT(*) as totalCount ${baseSql}${whereSql}`;
  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error('Error fetching admin count:', countErr);
      return res.status(500).json({ error: countErr.message });
    }
    const totalCount = countResult[0]?.totalCount || 0;

    // 2. 실제 데이터 쿼리
    let dataSql = `SELECT * ${baseSql}${whereSql}`;
    if (limit !== 'all') {
      const offset = (page - 1) * limit;
      dataSql += ` LIMIT ${limit} OFFSET ${offset}`;
    }
    db.query(dataSql, params, (err, results) => {
      if (err) {
        console.error('Error fetching admin data:', err);
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ data: results, totalCount });
      }
    });
  });
});

app.delete('/admin/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const sql = `DELETE FROM ${type} WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Record deleted successfully' });
    }
  });
});

app.put('/admin/:type/:id', (req, res) => {
  const { type, id } = req.params;
  let updateData = { ...req.body };
  
  console.log(`🔧 Admin update request: ${type}/${id}`, updateData);
  
  // YM, Staff, Teachers의 경우 gender 변환 처리
  if (['ym', 'staff', 'teachers'].includes(type) && updateData.gender) {
    if (updateData.gender === '남자') {
      updateData.gender = 'male';
    } else if (updateData.gender === '여자') {
      updateData.gender = 'female';
    }
  }
  
  // 시스템 필드들은 업데이트에서 제외
  const systemFields = ['id', 'created_at', 'updated_at', 'qrCode'];
  systemFields.forEach(field => {
    delete updateData[field];
  });
  
  console.log(`🔧 Cleaned update data:`, updateData);
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updateData);
  values.push(id);
  
  const sql = `UPDATE ${type} SET ${fields} WHERE id = ?`;
  
  console.log(`🔧 SQL: ${sql}`);
  console.log(`🔧 Values:`, values);
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error updating admin data:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('✅ Admin update successful:', result);
      res.status(200).json({ message: 'Record updated successfully' });
    }
  });
});

// Export students Excel (only selected columns)
app.get('/admin/students/export', (req, res) => {
  const { search } = req.query;
  let sql = `SELECT koreanName, englishName, churchName, churchNumber, parentContact, shirtSize, gender FROM students`;
  let params = [];
  if (search) {
    sql += ` WHERE koreanName LIKE ? OR englishName LIKE ? OR churchName LIKE ?`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error exporting students:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    // Excel 파일 생성
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=students_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// Export YM Excel (only selected columns)
app.get('/admin/ym/export', (req, res) => {
  const { search } = req.query;
  let sql = `SELECT name, englishName, churchName, churchNumber, contact, shirtSize, gender, awanaRole, position FROM ym`;
  let params = [];
  if (search) {
    sql += ` WHERE name LIKE ? OR englishName LIKE ? OR churchName LIKE ?`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error exporting ym:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'YM');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=ym_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// Export Teachers Excel (only selected columns)
app.get('/admin/teachers/export', (req, res) => {
  const { search } = req.query;
  let sql = `SELECT name, englishName, churchName, churchNumber, contact, shirtSize, gender, awanaRole, position FROM teachers`;
  let params = [];
  if (search) {
    sql += ` WHERE name LIKE ? OR englishName LIKE ? OR churchName LIKE ?`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error exporting teachers:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=teachers_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// Export Staff Excel (only selected columns)
app.get('/admin/staff/export', (req, res) => {
  const { search } = req.query;
  let sql = `SELECT name, englishName, churchName, churchNumber, contact, shirtSize, gender, awanaRole, position FROM staff`;
  let params = [];
  if (search) {
    sql += ` WHERE name LIKE ? OR englishName LIKE ? OR churchName LIKE ?`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error exporting staff:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=staff_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// Attendance
app.get('/attendance', (req, res) => {
  const { search, day, session, group, team } = req.query;
  
  let sql = `
    SELECT a.*, s.koreanName, s.englishName, s.churchName, s.gender
    FROM attendance a
    JOIN students s ON a.studentId = s.id
    WHERE 1=1
  `;
  let params = [];

  if (search) {
    sql += ` AND (s.koreanName LIKE ? OR s.englishName LIKE ? OR s.churchName LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (day) {
    sql += ` AND DATE(a.checkInTime) = ?`;
    params.push(day);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching attendance data:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get session attendance with filtered user types for better performance
app.get('/attendance/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { userTypes } = req.query; // 쿼리 매개변수로 사용자 타입 받기
  
  // userTypes가 문자열이면 배열로 변환, 없으면 모든 타입 포함
  let allowedTypes = ['student', 'ym', 'teacher', 'staff'];
  if (userTypes) {
    allowedTypes = Array.isArray(userTypes) ? userTypes : userTypes.split(',');
  }
  
  console.log(`📋 Fetching attendance for session: ${sessionId}, types: ${allowedTypes.join(', ')}`);
  
  // 필요한 사용자 타입만 조회하도록 동적 쿼리 생성
  const queries = [];
  const params = [];
  
  if (allowedTypes.includes('student')) {
    queries.push(`
      SELECT 
        'student' as user_type,
        s.id,
        s.student_id as user_id,
        s.koreanName as name,
        s.englishName,
        s.churchName,
        s.studentGroup,
        s.team,
        CASE WHEN sa.id IS NOT NULL THEN 1 ELSE 0 END as attended,
        sa.attended_at as attendedAt
      FROM students s
      LEFT JOIN session_attendance sa ON s.id = sa.user_id AND sa.session_id = ? AND sa.user_type = 'student'
    `);
    params.push(sessionId);
  }
  
  if (allowedTypes.includes('ym')) {
    queries.push(`
      SELECT 
        'ym' as user_type,
        y.id,
        y.id as user_id,
        y.name,
        y.englishName,
        y.churchName,
        y.awanaRole as studentGroup,
        y.position as team,
        CASE WHEN sa.id IS NOT NULL THEN 1 ELSE 0 END as attended,
        sa.attended_at as attendedAt
      FROM ym y
      LEFT JOIN session_attendance sa ON y.id = sa.user_id AND sa.session_id = ? AND sa.user_type = 'ym'
    `);
    params.push(sessionId);
  }
  
  if (allowedTypes.includes('teacher')) {
    queries.push(`
      SELECT 
        'teacher' as user_type,
        t.id,
        t.id as user_id,
        t.name,
        t.englishName,
        t.churchName,
        t.awanaRole as studentGroup,
        t.position as team,
        CASE WHEN sa.id IS NOT NULL THEN 1 ELSE 0 END as attended,
        sa.attended_at as attendedAt
      FROM teachers t
      LEFT JOIN session_attendance sa ON t.id = sa.user_id AND sa.session_id = ? AND sa.user_type = 'teacher'
    `);
    params.push(sessionId);
  }
  
  if (allowedTypes.includes('staff')) {
    queries.push(`
      SELECT 
        'staff' as user_type,
        st.id,
        st.id as user_id,
        st.name,
        st.englishName,
        st.churchName,
        st.awanaRole as studentGroup,
        st.position as team,
        CASE WHEN sa.id IS NOT NULL THEN 1 ELSE 0 END as attended,
        sa.attended_at as attendedAt
      FROM staff st
      LEFT JOIN session_attendance sa ON st.id = sa.user_id AND sa.session_id = ? AND sa.user_type = 'staff'
    `);
    params.push(sessionId);
  }
  
  if (queries.length === 0) {
    return res.status(200).json([]);
  }
  
  const sql = queries.join(' UNION ALL ') + ' ORDER BY user_type, name';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching session attendance:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log(`✅ Found ${results.length} total users for session ${sessionId}`);
      res.status(200).json(results);
    }
  });
});

// Check attendance for a session
app.post('/attendance/check', (req, res) => {
  const { sessionId, studentId } = req.body;
  console.log(`✅ Checking attendance: Session ${sessionId}, ID ${studentId}`);
  
  // QR 코드에서 사용자 타입과 ID 추출
  let userId, userType, tableName;
  
  if (studentId.includes('userId=')) {
    // 학생 QR 코드: userId=123
    userId = studentId.split('userId=')[1].split('&')[0];
    userType = 'student';
    tableName = 'students';
  } else if (studentId.includes('ymId=')) {
    // YM QR 코드: ymId=123&type=ym
    userId = studentId.split('ymId=')[1].split('&')[0];
    userType = 'ym';
    tableName = 'ym';
  } else if (studentId.includes('teacherId=')) {
    // 교사 QR 코드: teacherId=123&type=teacher
    userId = studentId.split('teacherId=')[1].split('&')[0];
    userType = 'teacher';
    tableName = 'teachers';
  } else if (studentId.includes('staffId=')) {
    // 스태프 QR 코드: staffId=123&type=staff
    userId = studentId.split('staffId=')[1].split('&')[0];
    userType = 'staff';
    tableName = 'staff';
  } else {
    // 직접 입력된 ID (학생 ID로 가정)
    userId = studentId.trim();
    userType = 'student';
    tableName = 'students';
  }
  
  console.log(`👤 Extracted: Type=${userType}, ID=${userId}, Table=${tableName}`);
  
  // 사용자 존재 확인을 위한 쿼리 구성
  let checkUserSql;
  let nameFields;
  
  if (userType === 'student') {
    checkUserSql = `
      SELECT id, koreanName, englishName, student_id 
      FROM students 
      WHERE student_id = ? OR id = ?
    `;
    nameFields = ['koreanName', 'englishName'];
  } else {
    checkUserSql = `
      SELECT id, name, englishName 
      FROM ${tableName} 
      WHERE id = ?
    `;
    nameFields = ['name', 'englishName'];
  }
  
  const queryParams = userType === 'student' ? [userId, userId] : [userId];
  
  db.query(checkUserSql, queryParams, (err, userResult) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (userResult.length === 0) {
      console.log(`❌ User not found: ${userId} (${userType})`);
      return res.status(400).json({ 
        success: false, 
        message: `등록되지 않은 ${getKoreanUserType(userType)}입니다.` 
      });
    }
    
    const user = userResult[0];
    const userName = userType === 'student' 
      ? `${user.koreanName} (${user.englishName})` 
      : `${user.name}${user.englishName ? ' (' + user.englishName + ')' : ''}`;
    
    console.log(`👤 Found ${userType}: ${userName}`);
    
      // 이미 출석했는지 확인 (인덱스 최적화)
  const checkAttendanceSql = `
    SELECT id FROM session_attendance 
    WHERE session_id = ? AND user_id = ? AND user_type = ?
    LIMIT 1
  `;
    
    db.query(checkAttendanceSql, [sessionId, user.id, userType], (err, attendanceResult) => {
      if (err) {
        console.error('Error checking existing attendance:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (attendanceResult.length > 0) {
        console.log(`⚠️ User already attended: ${userName}`);
        return res.status(400).json({ 
          success: false, 
          message: `이미 출석 처리된 ${getKoreanUserType(userType)}입니다.` 
        });
      }
      
      // 출석 기록
      const insertAttendanceSql = `
        INSERT INTO session_attendance (session_id, user_id, user_type, user_name, attended_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      db.query(insertAttendanceSql, [sessionId, user.id, userType, userName], (err, insertResult) => {
        if (err) {
          console.error('Error recording attendance:', err);
          return res.status(500).json({ error: 'Error recording attendance' });
        }
        
        console.log(`✅ Attendance recorded: ${userName} (${userType}) for session ${sessionId}`);
        res.status(200).json({
          success: true,
          userName: userName,
          userType: userType,
          userId: userType === 'student' ? user.student_id || user.id : user.id,
          internalId: user.id, // 내부 DB ID
          sessionId: sessionId,
          attendedAt: new Date()
        });
      });
    });
  });
});

// 사용자 타입의 한국어 변환 함수
function getKoreanUserType(userType) {
  switch(userType) {
    case 'student': return '학생';
    case 'ym': return 'YM';
    case 'teacher': return '교사';
    case 'staff': return '스태프';
    default: return '사용자';
  }
}

// Level Test APIs
// Submit level test results
app.post('/level-test/submit', (req, res) => {
  const { studentId, scores, totalScore, maxScore, percentage } = req.body;
  console.log(`📝 Level test submission for student ${studentId}: ${totalScore}/${maxScore} (${percentage}%)`);
  
  // Create level_tests table if it doesn't exist
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS level_tests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      scores JSON NOT NULL,
      total_score INT NOT NULL,
      max_score INT NOT NULL,
      percentage DECIMAL(5,2) NOT NULL,
      test_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      INDEX idx_student_id (student_id),
      INDEX idx_total_score (total_score DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  db.query(createTableSql, (err, createResult) => {
    if (err) {
      console.error('❌ Error creating level_tests table:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Check if student already has a test
    const checkExistingSql = 'SELECT id FROM level_tests WHERE student_id = ?';
    
    db.query(checkExistingSql, [studentId], (err, existingResult) => {
      if (err) {
        console.error('Error checking existing test:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingResult.length > 0) {
        // Update existing test
        const updateSql = `
          UPDATE level_tests 
          SET scores = ?, total_score = ?, max_score = ?, percentage = ?, test_date = NOW()
          WHERE student_id = ?
        `;
        
        db.query(updateSql, [JSON.stringify(scores), totalScore, maxScore, percentage, studentId], (err, updateResult) => {
          if (err) {
            console.error('Error updating level test:', err);
            return res.status(500).json({ error: 'Error updating test' });
          }
          
          console.log(`✅ Level test updated for student ${studentId}`);
            res.status(200).json({ 
              success: true, 
            message: 'Level test updated successfully',
            testId: existingResult[0].id,
            note: 'Students will be redistributed manually by admin'
          });
        });
      } else {
        // Insert new test
        const insertSql = `
          INSERT INTO level_tests (student_id, scores, total_score, max_score, percentage)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(insertSql, [studentId, JSON.stringify(scores), totalScore, maxScore, percentage], (err, insertResult) => {
          if (err) {
            console.error('Error inserting level test:', err);
            return res.status(500).json({ error: 'Error saving test' });
          }
          
          console.log(`✅ Level test saved for student ${studentId}`);
            res.status(200).json({ 
              success: true, 
            message: 'Level test saved successfully',
            testId: insertResult.insertId,
            note: 'Students will be redistributed manually by admin'
          });
        });
      }
    });
  });
});

// Get level test results
app.get('/level-test/results', (req, res) => {
  const sql = `
    SELECT 
      lt.*,
      s.koreanName,
      s.englishName,
      s.churchName,
      s.studentGroup,
      s.team
    FROM level_tests lt
    JOIN students s ON lt.student_id = s.id
    ORDER BY lt.total_score DESC, lt.test_date DESC
  `;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      console.error('Error fetching level test results:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get completed level tests (for dashboard)
app.get('/level-test/completed', (req, res) => {
  console.log('📊 Fetching completed level tests for dashboard...');
  
  const sql = `
    SELECT 
      lt.student_id,
      lt.total_score,
      lt.percentage,
      lt.test_date,
      s.koreanName,
      s.englishName,
      s.churchName,
      s.studentGroup,
      s.team
    FROM level_tests lt
    JOIN students s ON lt.student_id = s.id
    ORDER BY lt.test_date DESC
  `;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      console.error('Error fetching completed level tests:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log(`✅ Found ${results.length} completed level tests`);
      res.status(200).json(results);
    }
  });
});

// Redistribute students by level test scores
function redistributeStudentsByLevel(callback) {
  console.log('🔄 Redistributing students based on level test scores...');
  
  // Get all students with level test scores, ordered by total score (highest first)
  const getStudentsWithScoresSql = `
    SELECT 
      s.id,
      s.koreanName,
      s.englishName,
      s.studentGroup as currentGroup,
      lt.total_score,
      lt.percentage
    FROM students s
    JOIN level_tests lt ON s.id = lt.student_id
    ORDER BY lt.total_score DESC
  `;
  
  db.query(getStudentsWithScoresSql, [], (err, students) => {
    if (err) {
      console.error('Error getting students with scores:', err);
      if (callback) callback(err);
      return;
    }
    
    if (students.length === 0) {
      console.log('No students with level test scores found');
      if (callback) callback();
      return;
    }
    
    console.log(`📊 Starting redistribution for ${students.length} students by global ranking...`);
    
    const groups = ['KNOW', 'LOVE', 'SERVE', 'GLORY', 'HOLY', 'GRACE', 'HOPE'];
    const teams = [1, 2, 3, 4, 5];
    const totalStudents = students.length;
    
    // Calculate students per team (20% each)
    const studentsPerTeam = Math.ceil(totalStudents / teams.length);
    
    const updates = [];
    
    students.forEach((student, globalIndex) => {
      // Calculate team based on global ranking percentile
      // Top 20% (0-19%ile) -> Team 1, 20-39%ile -> Team 2, etc.
      const teamIndex = Math.floor(globalIndex / studentsPerTeam);
      const assignedTeam = Math.min(teamIndex + 1, teams.length); // 1~5조
      
      // Calculate global percentile (0-based)
      const globalPercentile = Math.floor((globalIndex / totalStudents) * 100);
      const percentileRange = teamIndex * 20;
      
      // Within the same team, distribute across groups cyclically
      // This ensures even distribution: KNOW, LOVE, SERVE, GLORY, HOLY, GRACE, HOPE rotation
      const positionInTeam = globalIndex % studentsPerTeam;
      const groupIndex = positionInTeam % groups.length;
      const assignedGroup = groups[groupIndex];
      
      updates.push([assignedGroup, assignedTeam, student.id]);
      
      console.log(`📊 Rank ${globalIndex + 1}/${totalStudents} (${globalPercentile}%ile) - ${student.koreanName} (${student.total_score}점) -> ${assignedGroup}-${assignedTeam}조 [${percentileRange}-${Math.min(percentileRange + 19, 99)}%ile범위]`);
    });
    
    if (updates.length === 0) {
      console.log('No updates needed');
      if (callback) callback();
      return;
    }
    
    // Log team and group distribution
    const teamDistribution = {};
    const groupTeamDistribution = {};
    const groupDistribution = {};
    
    updates.forEach(([group, team, studentId]) => {
      // Count by team
      if (!teamDistribution[team]) teamDistribution[team] = 0;
      teamDistribution[team]++;
      
      // Count by group
      if (!groupDistribution[group]) groupDistribution[group] = 0;
      groupDistribution[group]++;
      
      // Count by group-team combination
      const key = `${group}-${team}조`;
      if (!groupTeamDistribution[key]) groupTeamDistribution[key] = 0;
      groupTeamDistribution[key]++;
    });
    
    console.log('🎯 === 레벨테스트 기반 재배정 결과 ===');
    console.log('📊 조별 분포 (전체 순위 기반):', teamDistribution);
    console.log('📊 그룹별 분포 (균등 배치):', groupDistribution);
    console.log('📊 그룹-조 조합별 분포:', groupTeamDistribution);
    
    // Show percentile ranges for each team
    console.log('🎯 조별 백분위 범위:');
    teams.forEach((team, idx) => {
      const startPercentile = idx * 20;
      const endPercentile = Math.min((idx + 1) * 20 - 1, 99);
      const studentsInTeam = teamDistribution[team] || 0;
      console.log(`   ${team}조: ${startPercentile}-${endPercentile}%ile (${studentsInTeam}명)`);
    });
    
    // Batch update students
    const updateSql = 'UPDATE students SET studentGroup = ?, team = ? WHERE id = ?';
    
    let completed = 0;
    let hasError = false;
    
    console.log(`🔄 Updating ${updates.length} students...`);
    
    updates.forEach(update => {
      db.query(updateSql, update, (err, result) => {
        completed++;
        
        if (err && !hasError) {
          hasError = true;
          console.error('Error updating student group/team:', err);
          if (callback) callback(err);
          return;
        }
        
        if (completed === updates.length && !hasError) {
          console.log(`✅ Successfully redistributed ${updates.length} students based on level test scores`);
          console.log('🎯 === 배정 로직 ===');
          console.log('   1. 전체 학생을 레벨테스트 점수 순으로 정렬 (높은 점수부터)');
          console.log('   2. 상위 20% -> 1조, 21-40% -> 2조, 41-60% -> 3조, 61-80% -> 4조, 81-100% -> 5조');
          console.log('   3. 각 조 내에서 그룹을 순환 배치: KNOW -> LOVE -> SERVE -> GLORY -> HOLY -> GRACE -> HOPE');
          console.log('   4. 결과: love1조, grace1조, know1조, serve1조, glory1조, holy1조, hope1조 (1조 내 균등배치)');
          console.log('⚠️ 주의: 새로운 학생이 레벨테스트를 완료하면 기존 학생들의 조/그룹이 변경될 수 있음');
          if (callback) callback();
        }
      });
    });
  });
}

// Manual redistribution endpoint
app.post('/level-test/redistribute', (req, res) => {
  redistributeStudentsByLevel((err) => {
    if (err) {
      res.status(500).json({ error: 'Error redistributing students', details: err.message });
    } else {
      res.status(200).json({ success: true, message: 'Students redistributed successfully' });
    }
  });
});

// Item Distribution APIs
// Initialize item distribution table
app.post('/init-item-distribution', (req, res) => {
  console.log('🔧 Initializing item distribution table...');
  
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS item_distribution (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      distributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_distribution (student_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      INDEX idx_student_id (student_id),
      INDEX idx_distributed_at (distributed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('❌ Error creating item_distribution table:', err);
      res.status(500).json({ error: 'Error creating table', details: err.message });
    } else {
      console.log('✅ Item distribution table initialized successfully');
      res.status(200).json({ 
        message: 'Item distribution system initialized successfully',
        tablesCreated: true
      });
    }
  });
});

// Get item distribution progress
app.get('/item-distribution/progress', (req, res) => {
  console.log('📊 Fetching item distribution progress...');
  
  // 전체 학생 수(출석체크 기준)와 물품 수령 완료 수 조회
  const sql = `
    SELECT 
      (SELECT COUNT(DISTINCT user_id) 
       FROM session_attendance 
       WHERE user_type = 'student' 
       AND session_id = 'session1') as total_students,
      (SELECT COUNT(*) FROM item_distribution) as completed_count
  `;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      console.error('Error fetching distribution progress:', err);
      res.status(500).json({ error: err.message });
    } else {
      const { total_students, completed_count } = results[0];
      console.log(`📊 Progress: ${completed_count}/${total_students} students completed`);
      res.status(200).json({
        totalStudents: total_students,
        completedCount: completed_count,
        percentage: total_students > 0 ? Math.round((completed_count / total_students) * 100) : 0
      });
    }
  });
});

// Check if student has received items
app.get('/item-distribution/check/:studentId', (req, res) => {
  const { studentId } = req.params;
  
  const sql = 'SELECT * FROM item_distribution WHERE student_id = ?';
  
  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error checking item distribution:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({
        hasReceived: results.length > 0,
        distributedAt: results.length > 0 ? results[0].distributed_at : null
      });
    }
  });
});

// Record item distribution
app.post('/item-distribution/complete', (req, res) => {
  const { studentId } = req.body;
  console.log(`📦 Recording item distribution for student ${studentId}`);
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  // 학생 존재 확인
  const checkStudentSql = 'SELECT id, koreanName, englishName FROM students WHERE id = ?';
  
  db.query(checkStudentSql, [studentId], (err, studentResult) => {
    if (err) {
      console.error('Error checking student:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (studentResult.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = studentResult[0];
    
    // 이미 수령했는지 확인
    const checkDistributionSql = 'SELECT id FROM item_distribution WHERE student_id = ?';
    
    db.query(checkDistributionSql, [studentId], (err, distributionResult) => {
      if (err) {
        console.error('Error checking existing distribution:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (distributionResult.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: '이미 물품을 수령한 학생입니다.' 
        });
      }
      
      // 물품 수령 기록
      const insertSql = `
        INSERT INTO item_distribution (student_id, distributed_at)
        VALUES (?, NOW())
      `;
      
      db.query(insertSql, [studentId], (err, insertResult) => {
        if (err) {
          console.error('Error recording item distribution:', err);
          return res.status(500).json({ error: 'Error recording distribution' });
        }
        
        console.log(`✅ Item distribution recorded for ${student.koreanName} (${student.englishName})`);
        res.status(200).json({
          success: true,
          message: `${student.koreanName} 학생의 물품 전달이 완료되었습니다.`,
          studentName: `${student.koreanName} (${student.englishName})`,
          distributedAt: new Date()
        });
      });
    });
  });
});

// Get completed distributions list
app.get('/item-distribution/completed', (req, res) => {
  const sql = `
    SELECT 
      id.id,
      id.student_id,
      id.distributed_at,
      s.koreanName,
      s.englishName,
      s.churchName,
      s.studentGroup,
      s.team,
      s.student_id as student_code
    FROM item_distribution id
    JOIN students s ON id.student_id = s.id
    ORDER BY id.distributed_at DESC
  `;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      console.error('Error fetching completed distributions:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// Helper function for Korean user type
function getKoreanUserType(userType) {
  switch (userType) {
    case 'student': return '학생';
    case 'ym': return 'YM';
    case 'teacher': return '교사';
    case 'staff': return '스태프';
    default: return '사용자';
  }
}

app.post('/attendance', (req, res) => {
  const { qrCode } = req.body;
  
  // QR 코드에서 userId 추출
  const userId = qrCode.split('userId=')[1];
  
  if (!userId) {
    return res.status(400).json({ error: 'Invalid QR code format' });
  }

  const sqlInsertAttendance = 'INSERT INTO attendance (studentId, checkInTime) VALUES (?, NOW())';
  db.query(sqlInsertAttendance, [userId], (err, result) => {
    if (err) {
      console.error('Error recording attendance:', err);
      res.status(500).json({ error: 'Error recording attendance' });
      return;
    }

    const sqlGetStudent = 'SELECT koreanName, englishName FROM students WHERE id = ?';
    db.query(sqlGetStudent, [userId], (err, studentResult) => {
      if (err) {
        console.error('Error fetching student data:', err);
        res.status(500).json({ error: 'Error fetching student data' });
        return;
      }

      if (studentResult.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentData = studentResult[0];
      res.status(200).json({
        name: `${studentData.koreanName} / ${studentData.englishName}`,
        id: userId,
        checkInTime: new Date()
      });
    });
  });
});

// Download Excel
app.get('/download', (req, res) => {
  const { search, day, session, group, team } = req.query;
  
  let sql = `
    SELECT s.*, a.checkInTime
    FROM students s
    LEFT JOIN attendance a ON s.id = a.studentId
    WHERE 1=1
  `;
  let params = [];

  if (search) {
    sql += ` AND (s.koreanName LIKE ? OR s.englishName LIKE ? OR s.churchName LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching data for download:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    // Excel 파일 생성
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=students_attendance.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// Update QR codes for existing data
app.post('/update-qr-codes', (req, res) => {
  console.log('🔄 Updating QR codes for existing data...');
  
  // Update YM QR codes
  const updateYMQR = () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT id FROM ym WHERE qrCode IS NULL', [], (err, results) => {
        if (err) return reject(err);
        
        const promises = results.map(row => {
          return new Promise((resolveItem, rejectItem) => {
            const qrUrl = `https://awanaevent.com/tntcamp/qr-pin?ymId=${row.id}&type=ym`;
            QRCode.toDataURL(qrUrl, (err, url) => {
              if (err) return rejectItem(err);
              
              db.query('UPDATE ym SET qrCode = ? WHERE id = ?', [url, row.id], (err, result) => {
                if (err) return rejectItem(err);
                resolveItem();
              });
            });
          });
        });
        
        Promise.all(promises).then(() => resolve(`YM: ${results.length} updated`)).catch(reject);
      });
    });
  };

  // Update Teachers QR codes
  const updateTeachersQR = () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT id FROM teachers WHERE qrCode IS NULL', [], (err, results) => {
        if (err) return reject(err);
        
        const promises = results.map(row => {
          return new Promise((resolveItem, rejectItem) => {
            const qrUrl = `https://awanaevent.com/tntcamp/qr-pin?teacherId=${row.id}&type=teacher`;
            QRCode.toDataURL(qrUrl, (err, url) => {
              if (err) return rejectItem(err);
              
              db.query('UPDATE teachers SET qrCode = ? WHERE id = ?', [url, row.id], (err, result) => {
                if (err) return rejectItem(err);
                resolveItem();
              });
            });
          });
        });
        
        Promise.all(promises).then(() => resolve(`Teachers: ${results.length} updated`)).catch(reject);
      });
    });
  };

  // Update Staff QR codes
  const updateStaffQR = () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT id FROM staff WHERE qrCode IS NULL', [], (err, results) => {
        if (err) return reject(err);
        
        const promises = results.map(row => {
          return new Promise((resolveItem, rejectItem) => {
            const qrUrl = `https://awanaevent.com/tntcamp/qr-pin?staffId=${row.id}&type=staff`;
            QRCode.toDataURL(qrUrl, (err, url) => {
              if (err) return rejectItem(err);
              
              db.query('UPDATE staff SET qrCode = ? WHERE id = ?', [url, row.id], (err, result) => {
                if (err) return rejectItem(err);
                resolveItem();
              });
            });
          });
        });
        
        Promise.all(promises).then(() => resolve(`Staff: ${results.length} updated`)).catch(reject);
      });
    });
  };

  Promise.all([updateYMQR(), updateTeachersQR(), updateStaffQR()])
    .then((results) => {
      console.log('✅ QR codes updated:', results);
      res.status(200).json({ message: 'QR codes updated successfully', details: results });
    })
    .catch((error) => {
      console.error('❌ Error updating QR codes:', error);
      res.status(500).json({ error: 'Error updating QR codes', details: error.message });
    });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 TNT Camp Backend Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Health Check: http://localhost:${PORT}/health`);
  console.log(`   - Frontend Apps should connect to: http://localhost:${PORT}`);
}); 