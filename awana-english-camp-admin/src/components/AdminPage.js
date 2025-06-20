import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import "./AdminPage.css";
import { BACKEND_URL } from "../config";

const AdminPage = () => {
  const [data, setData] = useState([]);
  const [type, setType] = useState("students");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    const params = {
      search,
      page,
    };

    if (limit !== 'all') {
      params.limit = limit;
    }

    axios
      .get(`${BACKEND_URL}/admin/${type}`, {
        params,
      })
      .then((response) => {
        console.log("Fetched data:", response.data); // 콘솔에 데이터 출력
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [type, search, limit, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleDelete = (id) => {
    if (window.confirm("삭제하시겠습니까?")) {
      axios
        .delete(`${BACKEND_URL}/admin/${type}/${id}`)
        .then(() => {
          fetchData();
        })
        .catch((error) => {
          console.error("Error deleting data:", error);
        });
    }
  };

  const handleEdit = (item) => {
    console.log('🖊️ Edit button clicked for item:', item);
    console.log('🖊️ Item ID type:', typeof item.id, 'Value:', item.id);
    setEditItem(item);
    
    // gender 값을 프론트엔드 표시용으로 변환
    const editDataFormatted = { ...item };
    if (editDataFormatted.gender === 'male') {
      editDataFormatted.gender = '남자';
    } else if (editDataFormatted.gender === 'female') {
      editDataFormatted.gender = '여자';
    }
    
    setEditData(editDataFormatted);
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = () => {
    console.log(`📤 Sending update for ${type}/${editItem.id}:`, editData);
    
    // gender 값을 백엔드 저장용으로 변환
    const dataToSend = { ...editData };
    if (dataToSend.gender === '남자') {
      dataToSend.gender = 'male';
    } else if (dataToSend.gender === '여자') {
      dataToSend.gender = 'female';
    }
    
    console.log(`📤 Data after conversion:`, dataToSend);
    
    axios
      .put(`${BACKEND_URL}/admin/${type}/${editItem.id}`, dataToSend)
      .then((response) => {
        console.log('✅ Update successful:', response.data);
        setEditItem(null);
        fetchData();
        alert('수정이 완료되었습니다.');
      })
      .catch((error) => {
        console.error("❌ Error updating data:", error);
        alert(`수정 중 오류가 발생했습니다: ${error.response?.data?.error || error.message}`);
      });
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  const handleLimitChange = (e) => {
    const newLimit = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setPage(1);
  };

  const handleAssignGroups = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/admin/assign-groups`);
      alert(response.data.message);
    } catch (error) {
      console.error("Error assigning groups:", error);
      alert("Error assigning groups. Please try again.");
    }
  };

  const handleRankAssignment = async () => {
    try {
      const response = await axios.put(`${BACKEND_URL}/score/all-rank`);
      alert(response.data.message);
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error("Error assigning ranks:", error);
      alert("Error assigning ranks. Please try again.");
    }
  };

  const getColumns = () => {
    switch (type) {
      case "students":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "한글이름", key: "koreanName" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "부모연락처", key: "parentContact" },
          { displayName: "특이사항", key: "healthNotes" },
          { displayName: "옷사이즈", key: "shirtSize" },
          { displayName: "성별", key: "gender" },
          { displayName: "그룹", key: "studentGroup" },
          { displayName: "조", key: "team" }
        ];
      case "ym":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "이름", key: "name" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "성별", key: "gender" },
          { displayName: "클럽", key: "awanaRole" },
          { displayName: "학년", key: "position" },
          { displayName: "연락처", key: "contact" },
          { displayName: "옷사이즈", key: "shirtSize" },
        ];
      case "teachers":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "이름", key: "name" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "성별", key: "gender" },
          { displayName: "어와나 역할", key: "awanaRole" },
          { displayName: "직분", key: "position" },
          { displayName: "연락처", key: "contact" },
          { displayName: "옷사이즈", key: "shirtSize" },
        ];
      case "staff":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "이름", key: "name" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "성별", key: "gender" },
          { displayName: "어와나 역할", key: "awanaRole" },
          { displayName: "직분", key: "position" },
          { displayName: "연락처", key: "contact" },
          { displayName: "옷사이즈", key: "shirtSize" },
        ];
      case "scores":
        return [
          { displayName: "ID", key: "id" },
          { displayName: "학생 ID", key: "student_id" },
          { displayName: "질문 1", key: "question1" },
          { displayName: "질문 2", key: "question2" },
          { displayName: "질문 3", key: "question3" },
          { displayName: "질문 4", key: "question4" },
          { displayName: "질문 5", key: "question5" },
          { displayName: "질문 6", key: "question6" },
          { displayName: "질문 7", key: "question7" },
          { displayName: "질문 8", key: "question8" },
          { displayName: "질문 9", key: "question9" },
          { displayName: "총점", key: "total" },
          { displayName: "등급", key: "rank" },
        ];
      default:
        return [];
    }
  };

  const renderTableHeader = () => {
    const columns = getColumns();
    return (
      <tr>
        {columns.map((column) => (
          <th key={column.key}>{column.displayName}</th>
        ))}
        <th>Actions</th>
      </tr>
    );
  };

  const renderTableRows = () => {
    const columns = getColumns();
    console.log("Data for rows:", data); // 데이터가 올바르게 매핑되는지 확인
    
    const formatCellValue = (item, column) => {
      if (column.key === 'gender') {
        return item[column.key] === 'male' ? '남자' : item[column.key] === 'female' ? '여자' : item[column.key];
      }
      return item[column.key];
    };
    
    return data.map((item) => (
      <tr key={item.id}>
        {columns.map((column) => (
          <td key={column.key}>{formatCellValue(item, column)}</td>
        ))}
        <td>
          <button onClick={() => handleEdit(item)}>Edit</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </td>
      </tr>
    ));
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${type}_data.xlsx`);
  };

  return (
    <div className="admin-page">
      <h1 onClick={handleTitleClick} style={{ cursor: "pointer" }}>
        Admin Page
      </h1>
      <div className="controls">
        <select onChange={handleTypeChange} value={type}>
          <option value="students">Students</option>
          <option value="ym">YM</option>
          <option value="teachers">Teachers</option>
          <option value="staff">Staff</option>
          <option value="attendance">Attendance</option>
          <option value="scores">Scores</option> {/* Scores 옵션 추가 */}
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleDownloadExcel}>Download Excel</button>
        <button onClick={handleAssignGroups}>Assign Groups</button> {/* 그룹 배정 버튼 추가 */}
        <button onClick={handleRankAssignment}>Assign Ranks</button> {/* 랭크 부여 버튼 추가 */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button onClick={() => handlePageChange(page + 1)}>Next</button>
          <select onChange={handleLimitChange} value={limit}>
            <option value={10}>10</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>
      <table>
        <thead>{renderTableHeader()}</thead>
        <tbody>{renderTableRows()}</tbody>
      </table>

      {editItem && (
        <div className="modal">
          <h2>Edit {type}</h2>
          {getColumns()
            .filter(column => !['created_at', 'updated_at', 'qrCode'].includes(column.key))
            .map((column) => (
            <div key={column.key}>
              <label>{column.displayName}</label>
              {column.key === 'gender' ? (
                <select
                  name={column.key}
                  value={editData[column.key] || ""}
                  onChange={handleEditChange}
                >
                  <option value="">선택하세요</option>
                  <option value="남자">남자</option>
                  <option value="여자">여자</option>
                </select>
              ) : column.key === 'awanaRole' && (type === 'ym') ? (
                <select
                  name={column.key}
                  value={editData[column.key] || ""}
                  onChange={handleEditChange}
                >
                  <option value="">선택하세요</option>
                  <option value="TREK">TREK</option>
                  <option value="JOURNEY">JOURNEY</option>
                </select>
              ) : column.key === 'position' && (type === 'ym') ? (
                <select
                  name={column.key}
                  value={editData[column.key] || ""}
                  onChange={handleEditChange}
                >
                  <option value="">선택하세요</option>
                  <option value="1학년">1학년</option>
                  <option value="2학년">2학년</option>
                  <option value="3학년">3학년</option>
                </select>
              ) : column.key === 'shirtSize' ? (
                <select
                  name={column.key}
                  value={editData[column.key] || ""}
                  onChange={handleEditChange}
                >
                  <option value="">선택하세요</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                  <option value="3XL">3XL</option>
                </select>
              ) : (
                <input
                  name={column.key}
                  value={editData[column.key] || ""}
                  onChange={handleEditChange}
                  disabled={column.key === 'id' || column.readOnly}
                />
              )}
            </div>
          ))}
          <button onClick={() => setEditItem(null)}>Cancel</button>
          <button onClick={handleEditSubmit}>Save</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
