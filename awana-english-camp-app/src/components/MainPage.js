import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer";
import "./MainPage.css";
import { BACKEND_URL } from "../config";

function MainPage() {
  const [name, setName] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [isChurch, setIsChurch] = useState(false);
  const [churchNumber, setChurchNumber] = useState("");
  const [contact, setContact] = useState("");
  const [userType, setUserType] = useState("student"); // student, teacher, staff, ym
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isChurch) {
      if (!churchNumber || !contact) {
        alert("교회 번호와 담당자 연락처를 입력해주세요.");
        return;
      }
      axios
        .post(`${BACKEND_URL}/checkchurch`, {
          churchNumber,
          contact,
        })
        .then((response) => {
          if (
            response.data &&
            response.data.students &&
            response.data.students.length > 0
          ) {
            navigate(`/churchdetails/${churchNumber}`);
          } else {
            alert("등록된 정보를 찾을 수 없습니다.");
          }
        })
        .catch((error) => {
          console.error("There was an error checking the church data!", error);
        });
    } else {
      if (!name || !parentContact) {
        alert("이름과 학부모 연락처를 입력해주세요.");
        return;
      }
      axios
        .post(`${BACKEND_URL}/checkUser`, {
          name,
          parentContact,
          userType,
        })
        .then((response) => {
          if (response.data && response.data.id) {
            if (userType === "teacher" || userType === "staff" || userType === "ym") {
              navigate(`/staffdetails/${response.data.id}`, {
                state: { table: response.data.tableName },
              });
            } else {
              navigate(`/details/${response.data.id}`);
            }
          } else {
            alert("등록된 정보를 찾을 수 없습니다.");
          }
        })
        .catch((error) => {
          console.error("There was an error checking the user data!", error);
        });
    }
  };

  const handleToggle = () => {
    setIsChurch(!isChurch);
  };

  return (  
    <div className="main-page">
      <Link to="/">
        <img src="/logo.png" alt="T&T Camp" className="main_logo" />
      </Link>
      <button
        className="main_btn"
        id="register"
        onClick={() => navigate("/select-role")}
      >
        신규 등록
      </button>
      <button
        type="button"
        className="main_btn"
        id="toggle_btn"
        onClick={handleToggle}
      >
        {isChurch
          ? "교회 등록 조회 취소\n(교회 담당자 전용)"
          : "교회 등록 조회\n(교회 담당자 전용)"}
      </button>
      <form onSubmit={handleSubmit} className="form">
        {isChurch ? (
          <>
            <input
              className="main_input"
              type="text"
              placeholder="교회 등록번호"
              id="churchNumber"
              value={churchNumber}
              onChange={(e) => setChurchNumber(e.target.value)}
              required
            />
            <input
              className="main_input"
              type="text"
              placeholder="담당자 연락처 (숫자만입력)"
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </>
        ) : (
          <>
            <input
              className="main_input"
              type="text"
              placeholder="이름"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="main_input"
              type="text"
              placeholder="학부모 연락처 (숫자만입력)"
              id="parentContact"
              value={parentContact}
              onChange={(e) => setParentContact(e.target.value)}
              required
            />
            <div style={{ color: "white", fontSize:"14px", marginTop: "10px" }}>
              <label style={{ marginRight: "20px" }}>
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === "student"}
                  onChange={(e) => setUserType(e.target.value)}
                  style={{ marginRight: "5px" }}
                />
                학생
              </label>
              <label style={{ marginRight: "20px" }}>
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === "teacher"}
                  onChange={(e) => setUserType(e.target.value)}
                  style={{ marginRight: "5px" }}
                />
                교사
              </label>
              <label style={{ marginRight: "20px" }}>
                <input
                  type="radio"
                  name="userType"
                  value="staff"
                  checked={userType === "staff"}
                  onChange={(e) => setUserType(e.target.value)}
                  style={{ marginRight: "5px" }}
                />
                스탭
              </label>
              <label>
                <input
                  type="radio"
                  name="userType"
                  value="ym"
                  checked={userType === "ym"}
                  onChange={(e) => setUserType(e.target.value)}
                  style={{ marginRight: "5px" }}
                />
                YM
              </label>
            </div>
          </>
        )}

        <button className="main_btn" id="submit" type="submit">
          등록 정보 조회
        </button>
      </form>
      <Footer />
    </div>
  );
}

export default MainPage;
