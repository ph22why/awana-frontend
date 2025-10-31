import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./DetailsPage.css";
import "./ChurchDetailsPage.css";
import Footer from "./Footer";
import { BACKEND_URL } from "../config";

function ChurchDetailsPage() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [ym, setYm] = useState([]);
  const [staff, setStaff] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("students");

  useEffect(() => {
    axios
      .post(`${BACKEND_URL}/checkchurch`, { churchNumber: id })
      .then((response) => {
        console.log("Church data received:", response.data);
        setStudents(response.data.students || []);
        setYm(response.data.ym || []);
        setStaff(response.data.staff || []);
        setTeachers(response.data.teachers || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
        setError("There was an error fetching the data!");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="details-page">
      <Link to="/">
        <img src="https://awanaevent.com/tntcamp/logo.png" alt="T&T Camp" className="register_logo" />
      </Link>
      <h2 className="main_tcamp">교회별 등록 현황</h2>
      <div className="tabs">
        <button onClick={() => setActiveTab("students")}>학생 ({students.length})</button>
        <button onClick={() => setActiveTab("ym")}>YM ({ym.length})</button>
        <button onClick={() => setActiveTab("teachers")}>교사 ({teachers.length})</button>
        <button onClick={() => setActiveTab("staff")}>스탭 ({staff.length})</button>
      </div>
      <div id="lists">
        {activeTab === "students" && students.length > 0 && students.map((student, index) => (
          <div className="info-card" key={index}>
            <div className="infos" id="top_info">
              <div className="information" id="infos">
                <p id="index">
                  {index + 1}. {student.koreanName} ({student.englishName})
                </p>
                <p className="name" id="index">
                  학부모 연락처: {student.parentContact}
                </p>
                <p className="name" id="studentlists">
                  옷 사이즈: {student.shirtSize} | 성별: {student.gender}
                </p>
              </div>
            </div>
          </div>
        ))}
        {activeTab === "students" && students.length === 0 && (
          <div>등록된 학생이 없습니다</div>
        )}

        {activeTab === "ym" && ym.length > 0 && ym.map((item, index) => (
          <div className="info-card" key={index}>
            <div className="infos" id="top_info">
              <div className="information" id="infos">
                <p id="index">
                  {index + 1}. {item.name}
                </p>
                <p className="name" id="index">
                  연락처: {item.contact}
                </p>
                <p className="name" id="studentlists">
                  옷 사이즈: {item.shirtSize} | 클럽: {item.awanaRole} | 학년: {item.position}
                </p>
              </div>
            </div>
          </div>
        ))}
        {activeTab === "ym" && ym.length === 0 && (
          <div>등록된 YM이 없습니다</div>
        )}

        {activeTab === "teachers" && teachers.length > 0 && teachers.map((item, index) => (
          <div className="info-card" key={index}>
            <div className="infos" id="top_info">
              <div className="information" id="infos">
                <p id="index">
                  {index + 1}. {item.name} ({item.englishName})
                </p>
                <p className="name" id="index">
                  연락처: {item.contact}
                </p>
                <p className="name" id="studentlists">
                  옷 사이즈: {item.shirtSize} | 역할: {item.awanaRole}
                </p>
              </div>
            </div>
          </div>
        ))}
        {activeTab === "teachers" && teachers.length === 0 && (
          <div>등록된 교사가 없습니다</div>
        )}

        {activeTab === "staff" && staff.length > 0 && staff.map((item, index) => (
          <div className="info-card" key={index}>
            <div className="infos" id="top_info">
              <div className="information" id="infos">
                <p id="index">
                  {index + 1}. {item.name} ({item.englishName})
                </p>
                <p className="name" id="index">
                  연락처: {item.contact}
                </p>
                <p className="name" id="studentlists">
                  옷 사이즈: {item.shirtSize} | 역할: {item.awanaRole}
                </p>
              </div>
            </div>
          </div>
        ))}
        {activeTab === "staff" && staff.length === 0 && (
          <div>등록된 스탭이 없습니다</div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ChurchDetailsPage;
