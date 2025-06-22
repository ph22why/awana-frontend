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
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3100', 'http://localhost:3101'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MySQL 설정 (Mac 로컬 환경)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tntcamp',
  charset: 'utf8mb4',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
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

  const sql = `INSERT INTO students (koreanName, englishName, churchName, churchNumber, phoneNumber, shirtSize, gender)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [koreanName, englishName, churchName, churchNumber, parentContact, shirtSize, genderEn], (err, result) => {
    if (err) {
      console.error('Error inserting student data:', err);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
      return;
    }

    const userId = result.insertId;
    console.log('✅ Student registered with ID:', userId);

    // QR 코드 생성 (로컬 환경용)
    const qrUrl = `http://localhost:3000/qr-pin?userId=${userId}`;
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
  const sql = `INSERT INTO ym (koreanName, englishName, churchName, churchNumber, gender, phoneNumber, shirtSize)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, englishName, churchName, churchNumber, genderEn, contact, shirtSize], (err, result) => {
    if (err) {
      console.error('Error inserting YM data:', err);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
    } else {
      const ymId = result.insertId;
      console.log('✅ YM registered with ID:', ymId);

      // QR 코드 생성 (YM용)
      const qrUrl = `http://localhost:3100/qr-pin?ymId=${ymId}&type=ym`;
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

  const sql = `INSERT INTO teachers (koreanName, englishName, churchName, churchNumber, gender, phoneNumber, shirtSize)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  console.log('🔍 Executing teacher insert with params:', [name, englishName, churchName, churchNumber, genderEn, contact, shirtSize]);
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderEn, contact, shirtSize], (err, result) => {
    if (err) {
      console.error('❌ Error inserting teacher data:', err);
      console.error('❌ SQL:', sql);
      console.error('❌ Params:', [name, englishName, churchName, churchNumber, genderEn, awanaRole, position, contact, shirtSize]);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
    } else {
      const teacherId = result.insertId;
      console.log('✅ Teacher registered with ID:', teacherId);

      // QR 코드 생성 (Teacher용)
      const qrUrl = `http://localhost:3100/qr-pin?teacherId=${teacherId}&type=teacher`;
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

  const sql = `INSERT INTO staff (koreanName, englishName, churchName, churchNumber, gender, phoneNumber, shirtSize)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, englishName, churchName, churchNumber, genderEn, contact, shirtSize], (err, result) => {
    if (err) {
      console.error('Error inserting staff data:', err);
      res.status(500).json({ error: 'Error inserting data', details: err.message });
    } else {
      const staffId = result.insertId;
      console.log('✅ Staff registered with ID:', staffId);

      // QR 코드 생성 (Staff용)
      const qrUrl = `http://localhost:3100/qr-pin?staffId=${staffId}&type=staff`;
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
  const { churchName, name, contact, churchNumber } = req.body;

  const sql = `INSERT INTO church (churchName, churchContact, churchNumber)
               VALUES (?, ?, ?)`;

  db.query(sql, [churchName, contact, churchNumber], (err, result) => {
    if (err) {
      console.error('Error inserting church data:', err);
      res.status(500).json({ error: 'Error inserting data' });
    } else {
      console.log('✅ Church registered with ID:', result.insertId);
      res.status(200).json({ id: result.insertId });
    }
  });
});

// Check User
app.post('/checkUser', (req, res) => {
  console.log('🔍 checkUser request received:', req.body);
  const { name, parentContact, userType } = req.body;
  
  let sql, tableName;
  
  switch (userType) {
    case 'teacher':
      sql = 'SELECT id FROM teachers WHERE koreanName = ? AND phoneNumber = ?';
      tableName = 'teachers';
      break;
    case 'staff':
      sql = 'SELECT id FROM staff WHERE koreanName = ? AND phoneNumber = ?';
      tableName = 'staff';
      break;
    case 'ym':
      sql = 'SELECT id FROM ym WHERE koreanName = ? AND phoneNumber = ?';
      tableName = 'ym';
      break;
    default: // student
      sql = 'SELECT id FROM students WHERE koreanName = ? AND phoneNumber = ?';
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
        if (result[0].name) {
          console.log('✅ Found name bytes:', Buffer.from(result[0].name, 'utf8'));
        } else if (result[0].koreanName) {
          console.log('✅ Found koreanName bytes:', Buffer.from(result[0].koreanName, 'utf8'));
        }
        res.status(200).json({ ...result[0], tableName });
      } else {
        console.log('❌ No user found');
        // 디버깅을 위해 비슷한 데이터 조회
        let debugSql;
        if (tableName === 'students' || tableName === 'ym') {
          debugSql = `SELECT koreanName, phoneNumber FROM ${tableName} LIMIT 5`;
        } else {
          debugSql = `SELECT koreanName, phoneNumber FROM ${tableName} LIMIT 5`;
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
    if (contact && church.churchContact !== contact) {
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
  const { koreanName, englishName, churchName, churchNumber, parentContact, healthNotes, shirtSize, gender } = req.body;
  const sql = `UPDATE students SET koreanName=?, englishName=?, churchName=?, churchNumber=?, phoneNumber=?, shirtSize=?, gender=? WHERE id=?`;
  
  db.query(sql, [koreanName, englishName, churchName, churchNumber, parentContact, shirtSize, gender, req.params.id], (err, result) => {
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
  
  const sql = `UPDATE staff SET koreanName=?, englishName=?, churchName=?, churchNumber=?, gender=?, phoneNumber=?, shirtSize=? WHERE id=?`;
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderForDB, contact, shirtSize, req.params.id], (err, result) => {
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
  const sql = `UPDATE ym SET koreanName=?, englishName=?, churchName=?, churchNumber=?, gender=?, phoneNumber=?, shirtSize=? WHERE id=?`;
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderForDB, contact, shirtSize, req.params.id], (err, result) => {
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
  
  const sql = `UPDATE teachers SET koreanName=?, englishName=?, churchName=?, churchNumber=?, gender=?, phoneNumber=?, shirtSize=? WHERE id=?`;
  
  db.query(sql, [name, englishName, churchName, churchNumber, genderForDB, contact, shirtSize, req.params.id], (err, result) => {
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
  const { search, page = 1, limit = 50 } = req.query;
  
  let sql = `SELECT * FROM ${type}`;
  let params = [];

  if (search) {
    // All tables now use koreanName
    sql += ` WHERE koreanName LIKE ? OR englishName LIKE ? OR churchName LIKE ?`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  if (limit !== 'all') {
    const offset = (page - 1) * limit;
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching admin data:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
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
            const qrUrl = `http://localhost:3100/qr-pin?ymId=${row.id}&type=ym`;
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
            const qrUrl = `http://localhost:3100/qr-pin?teacherId=${row.id}&type=teacher`;
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
            const qrUrl = `http://localhost:3100/qr-pin?staffId=${row.id}&type=staff`;
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