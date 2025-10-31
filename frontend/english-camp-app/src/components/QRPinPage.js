import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QRPinPage.css';

const QRPinPage = () => {
    const [pin, setPin] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const correctPin = '2024';
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const userId = urlParams.get('userId');
                const ymId = urlParams.get('ymId');
                const teacherId = urlParams.get('teacherId');
                const staffId = urlParams.get('staffId');

                if (userId) {
                    // 학생 정보 조회
                    const response = await axios.get(`https://awanaevent.com/user/${userId}`);
                    if (response.data && response.data.length > 0) {
                        setUserInfo({
                            type: 'student',
                            data: response.data[0]
                        });
                    }
                } else if (ymId) {
                    // YM 정보 조회
                    const response = await axios.get(`https://awanaevent.com/ym/${ymId}`);
                    if (response.data) {
                        setUserInfo({
                            type: 'ym',
                            data: response.data
                        });
                    }
                } else if (teacherId) {
                    // 교사 정보 조회
                    const response = await axios.get(`https://awanaevent.com/teacher/${teacherId}`);
                    if (response.data) {
                        setUserInfo({
                            type: 'teacher',
                            data: response.data
                        });
                    }
                } else if (staffId) {
                    // 스태프 정보 조회
                    const response = await axios.get(`https://awanaevent.com/staff/${staffId}`);
                    if (response.data) {
                        setUserInfo({
                            type: 'staff',
                            data: response.data
                        });
                    }
                }
            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (pin !== correctPin) {
            alert('Wrong Pin Number.');
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');

        if (!userId) {
            alert('There is no User.');
            return;
        }

        navigate(`/qr-details?userId=${userId}`);
    };

    const getUserTypeKorean = (type) => {
        switch (type) {
            case 'student': return '학생';
            case 'ym': return 'YM';
            case 'teacher': return '교사';
            case 'staff': return '스태프';
            default: return '사용자';
        }
    };

    if (loading) {
        return (
            <div className="qr-pin-page">
                <img src="https://awanaevent.com/tntcamp/logo.png" alt="T&T Camp" className="logo" />
                <h2>정보를 불러오는 중...</h2>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="qr-pin-page">
            <img src="https://awanaevent.com/tntcamp/logo.png" alt="T&T Camp" className="logo" />
            
            {userInfo ? (
                <div className="user-info-container">
                    <h2>🎯 스캔된 사용자 정보</h2>
                    
                    <div className="user-card">
                        <div className="user-type-badge">
                            {getUserTypeKorean(userInfo.type)}
                        </div>
                        
                        <div className="user-details">
                            <div className="user-avatar">
                                {userInfo.data.image ? (
                                    <img src={userInfo.data.image} alt="사용자 사진" />
                                ) : (
                                    <div className="default-avatar">👤</div>
                                )}
                            </div>
                            
                            <div className="user-text">
                                <h3>
                                    {userInfo.type === 'student' 
                                        ? `${userInfo.data.koreanName} (${userInfo.data.englishName})`
                                        : `${userInfo.data.name}${userInfo.data.englishName ? ' (' + userInfo.data.englishName + ')' : ''}`
                                    }
                                </h3>
                                <p>🏛️ {userInfo.data.churchName}</p>
                                {userInfo.type === 'student' && (
                                    <>
                                        <p>👕 옷 사이즈: {userInfo.data.shirtSize}</p>
                                        <p>🆔 학생번호: {userInfo.data.student_id || userInfo.data.id}</p>
                                        {userInfo.data.studentGroup && (
                                            <p>🎯 그룹: {userInfo.data.studentGroup} {userInfo.data.team}조</p>
                                        )}
                                    </>
                                )}
                                {(userInfo.type === 'ym' || userInfo.type === 'teacher' || userInfo.type === 'staff') && (
                                    <>
                                        <p>🎭 역할: {userInfo.data.awanaRole}</p>
                                        <p>📍 직책: {userInfo.data.position}</p>
                                        <p>📞 연락처: {userInfo.data.contact}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="success-message">
                        ✅ QR 코드 스캔이 완료되었습니다!
                    </div>
                </div>
            ) : (
                <div className="no-user-info">
                    <h2>❌ 사용자 정보를 찾을 수 없습니다</h2>
                    <p>올바른 QR 코드인지 확인해주세요.</p>
                </div>
            )}
            
            {/* <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    placeholder="Insert pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                />
                <button type="submit">confirm</button>
            </form> */}
        </div>
    );
};

export default QRPinPage;
