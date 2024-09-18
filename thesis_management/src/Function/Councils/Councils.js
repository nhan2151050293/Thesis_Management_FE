import React, { useContext, useState, useEffect } from 'react';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import { MyUserContext } from '../../configs/Contexts';
import APIs, { authApi, endpoints } from '../../configs/APIs';
import './Councils.css';
import { Spinner } from 'react-bootstrap';

const Councils = () => {
    const [councils, setCouncils] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    const [selectedCouncil, setSelectedCouncil] = useState(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showUpdateMemberModal, setShowUpdateMemberModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberUpdate, setMemberUpdate] = useState(null);

    const [newCouncil, setNewCouncil] = useState([]);
    const [filteredCouncils, setFilteredCouncils] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [councilToDelete, setCouncilToDelete] = useState(null);

    const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [showPresidentList, setShowPresidentList] = useState(false);
    const [showSecretaryList, setShowSecretaryList] = useState(false);
    const [showReviewerList, setShowReviewerList] = useState(false);
    const [showMember01List, setShowMember01List] = useState(false);
    const [showMember02List, setShowMember02List] = useState(false);
    const [showMemberUpdateList, setShowMemberUpdateList] = useState(false);
    const [showAddMemberInputs, setShowAddMemberInputs] = useState(false);

    const [showMemberFields, setShowMemberFields] = useState(false);

    const handleAddMembersClick = () => {
        setShowMemberFields(!showMemberFields);
        setSelectedMember01(null);
        setSelectedMember02(null);
        setShowAddMemberInputs(!showAddMemberInputs);
    };

    const [councilName, setCouncilName] = useState('');
    const [description, setDescription] = useState('');

    const [selectedPresident, setSelectedPresident] = useState(null);
    const [selectedSecretary, setSelectedSecretary] = useState(null);
    const [selectedReviewer, setSelectedReviewer] = useState(null);
    const [selectedMember01, setSelectedMember01] = useState(null);
    const [selectedMember02, setSelectedMember02] = useState(null);
    const [selectedUpdateMember, setSelectedUpdateMember] = useState(null);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = councils.filter(
            (council) =>
                council.name.toLowerCase().includes(query) || council.description.toLowerCase().includes(query),
        );
        setFilteredCouncils(filtered);
    };

    const loadCouncils = async () => {
        setLoading(true);
        try {
            const response = await APIs.get(endpoints['councils']);
            setCouncils(response.data.results);
            setFilteredCouncils(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách hội đồng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async (council_Id) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await authApi(token).get(endpoints['council-members'](council_Id));
            setMembers(response.data);
            console.log(response.data);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách thành viên. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadLecturers = async () => {
        setLoading(true);
        try {
            const response = await APIs.get(endpoints['lecturers']);
            setLecturers(response.data.results);
        } catch (error) {
            console.error(error);
            setError('Không thể tải danh sách hội đồng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCouncils();
        loadLecturers();
    }, []);

    const handleShowMembersModal = (council_Id) => {
        loadMembers(council_Id);
        setShowMembersModal(true);
    };

    const handleShowUpdateMemberModal = (member) => {
        setMemberUpdate(member);
        setShowUpdateMemberModal(true);
    };

    const handleShowAddModal = () => {
        setNewCouncil({
            name: '',
            description: '',
        });
        setShowAddModal(true);
    };

    const handlePresidentInputClick = () => {
        setShowPresidentList(!showPresidentList);
    };

    const handleSecretaryInputClick = () => {
        setShowSecretaryList(!showSecretaryList);
    };

    const handleReviewerInputClick = () => {
        setShowReviewerList(!showReviewerList);
    };

    const handleMember01InputClick = () => {
        setShowMember01List(!showMember01List);
    };

    const handleMember02InputClick = () => {
        setShowMember02List(!showMember02List);
    };

    const handleUpdateMemberInputClick = () => {
        setShowMemberUpdateList(!showMemberUpdateList);
    };

    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setShowAddModal(false);
        setShowPresidentList(false);
        setShowSecretaryList(false);
        setShowReviewerList(false);
        setSelectedCouncil('');
        setSelectedPresident(null);
        setSelectedSecretary(null);
        setSelectedReviewer(null);
        setSelectedMember01(null);
        setSelectedMember02(null);
        setShowMemberFields(false);
        setShowMembersModal(false);
        setShowUpdateMemberModal(false);
        setSelectedUpdateMember(null);
        setShowAddMemberInputs(false);
    };

    const handleCloseUpdateMemberModal = () => {
        setShowUpdateMemberModal(false);
        setSelectedUpdateMember(null);
    };

    const checkDuplicateLecturers = () => {
        const selectedLecturers = [
            selectedPresident.user,
            selectedSecretary.user,
            selectedReviewer.user,
            selectedMember01?.user,
            selectedMember02?.user,
        ];

        const lecturerCounts = selectedLecturers.reduce((acc, lecturer) => {
            if (lecturer) {
                acc[lecturer] = (acc[lecturer] || 0) + 1;
            }
            return acc;
        }, {});

        for (let count of Object.values(lecturerCounts)) {
            if (count > 1) {
                return true; // 1 giảng viên được chọn nhiều hơn 1 lần
            }
        }
        return false;
    };

    // Kiểm tra các vai trò bắt buộc
    const checkRequiredPositions = () => {
        if (!selectedPresident || !selectedSecretary || !selectedReviewer) {
            return false;
        }
        return true;
    };

    const handleAddCouncil = async () => {
        console.log(selectedPresident, selectedSecretary, selectedReviewer);
        if (checkDuplicateLecturers()) {
            alert('Một giảng viên chỉ được đảm nhiệm 1 vai trò trong hội đồng. Vui lòng chọn lại.');
            return;
        }

        if (!checkRequiredPositions()) {
            alert('Hội đồng phải có tối thiểu 3 thành viên là: Chủ tịch, Thư ký và Phản biện.');
            setLoading(false);
            return;
        }

        setLoading(true);

        const councilFormData = new FormData();
        councilFormData.append('name', councilName);
        councilFormData.append('description', description);
        councilFormData.append('is_lock', true);

        try {
            const res = await APIs.post(endpoints['councils'], councilFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const councilId = res.data.id;

            const councilDetails = [
                { position: 1, lecturer: selectedPresident.user, council: councilId },
                { position: 2, lecturer: selectedSecretary.user, council: councilId },
                { position: 3, lecturer: selectedReviewer.user, council: councilId },
            ];

            if (selectedMember01) {
                councilDetails.push({ position: 4, lecturer: selectedMember01.user, council: councilId });
            }

            if (selectedMember02) {
                councilDetails.push({ position: 5, lecturer: selectedMember02.user, council: councilId });
            }

            for (const detail of councilDetails) {
                await APIs.post(endpoints['council_details'], detail, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRFToken': 'LxGlGW539zpgT1OAzXIzW6GmxyHKK2Bl2sKYmispivUORsp7PLNV9xJFgTCUqqB7',
                    },
                });
            }

            handleCloseModal();

            alert('Thêm hội đồng thành công');
        } catch (error) {
            console.error(error);
            alert('Thêm hội đồng thất bại');
        } finally {
            loadCouncils();
            setLoading(false);
        }
    };

    const handleDelete = (council_id) => {
        setCouncilToDelete(council_id);
        setShowDeleteModal(true);
    };

    const confirmDeleteCouncil = async () => {
        if (councilToDelete) {
            try {
                await APIs.delete(endpoints['delete-council'](councilToDelete));
                loadCouncils();
                alert('Hội đồng đã được xóa thành công!');
            } catch (error) {
                console.error(error);
                alert('Không thể xóa hội đồng. Vui lòng thử lại sau.');
            } finally {
                setShowDeleteModal(false);
                setCouncilToDelete(null);
            }
        }
    };

    const handleShowUpdateModal = (council) => {
        setSelectedCouncil(council);
        setShowUpdateModal(true);
    };

    const handleUpdateCouncil = async () => {
        try {
            console.log(selectedCouncil, newCouncil.council, newCouncil.major, newCouncil.school_year);

            const formData = new FormData();
            formData.append('name', selectedCouncil.name);
            formData.append('description', selectedCouncil.description);
            formData.append('is_lock', selectedCouncil.is_lock);

            await APIs.patch(endpoints['update-council'](selectedCouncil.id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            loadCouncils();
            alert('Cập nhật khóa luận thành công!');
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert('Cập nhật khóa luận thất bại. Vui lòng thử lại.');
        }
    };

    const handleUpdateMember = async () => {
        try {
            const selectedMember = members.find((member) => member.lecturer_id === selectedUpdateMember.user);

            if (selectedMember) {
                alert('Giảng viên này đã là thành viên của hội đồng. Vui lòng chọn giảng viên khác');
                return;
            }

            const formData = new FormData();
            formData.append('id', selectedUpdateMember.id);
            formData.append('lecturer', selectedUpdateMember.user);
            formData.append('council', selectedCouncil.id);
            if (memberUpdate.position === 'Chủ tịch') {
                formData.append('position', 1);
            }

            if (memberUpdate.position === 'Thư ký') {
                formData.append('position', 2);
            }

            if (memberUpdate.position === 'Phản biện') {
                formData.append('position', 3);
            }

            if (memberUpdate.position === 'Thành viên 01') {
                formData.append('position', 4);
            }

            if (memberUpdate.position === 'Thành viên 02') {
                formData.append('position', 5);
            }

            console.log(formData);

            await APIs.patch(endpoints['update-council-detail'](memberUpdate.id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Cập nhật thành viên hội đồng thành công');
            loadMembers(selectedCouncil.id);
            setShowUpdateMemberModal(false);
        } catch (error) {
            console.error(error);
            alert('Cập nhật thành viên hội đồng thất bại. Vui lòng thử lại.');
        }
    };

    const handleDeleteMember = async (council_detail_id) => {
        console.log(council_detail_id);
        setMemberToDelete(council_detail_id);
        setShowDeleteMemberModal(true);
    };

    const confirmDeleteMember = async () => {
        if (memberToDelete) {
            try {
                await APIs.delete(endpoints['delete-council-detail'](memberToDelete));
                loadMembers(selectedCouncil.id);
                alert('Thành viên này đã được xóa thành công!');
            } catch (error) {
                console.error(error);
                alert('Không thể xóa thành viên này. Vui lòng thử lại sau.');
            } finally {
                setShowDeleteMemberModal(false);
                setMemberToDelete(null);
            }
        }
    };

    const handleAddMember = async () => {
        setLoading(true);
        try {
            const councilDetails = [];

            if (selectedMember01) {
                councilDetails.push({ position: 4, lecturer: selectedMember01.user, council: selectedCouncil.id });
            }

            if (selectedMember02) {
                councilDetails.push({ position: 5, lecturer: selectedMember02.user, council: selectedCouncil.id });
            }

            console.log(councilDetails);

            for (const detail of councilDetails) {
                await APIs.post(endpoints['council_details'], detail, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRFToken': 'LxGlGW539zpgT1OAzXIzW6GmxyHKK2Bl2sKYmispivUORsp7PLNV9xJFgTCUqqB7',
                    },
                });
            }

            alert('Thêm thành viên thành công');
            loadMembers(selectedCouncil.id);
        } catch (error) {
            console.error(error);
            alert('Lỗi trùng lặp giảng viên! Vui lòng chọn lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="container">
                <div className="council-header">
                    <h1 className="council-title">QUẢN LÍ HỘI ĐỒNG</h1>
                </div>

                {loading && <p>Đang tải...</p>}
                {error && <Alert variant="danger">{error}</Alert>}

                <div className="council-container">
                    <div className="search-container">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm hội đồng..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <button type="button" className="btn btn-primary add-btn" onClick={handleShowAddModal}>
                            Thêm hội đồng
                        </button>
                    </div>

                    {/* Bọc bảng trong div có lớp cho phép cuộn ngang */}
                    <div className="table-responsive">
                        <table className="councils-table">
                            <thead>
                                <tr>
                                    <th>Mã hội đồng</th>
                                    <th>Tên hội đồng</th>
                                    <th>Mô tả</th>
                                    <th>Trạng thái</th>
                                    <th>Thành viên</th>
                                    <th>Cập nhật</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCouncils && filteredCouncils.length > 0 ? (
                                    filteredCouncils.map((council, index) => (
                                        <tr key={index}>
                                            <td>{council.id}</td>
                                            <td>{council.name}</td>
                                            <td>{council.description}</td>
                                            <td>{council.is_lock === false ? 'Đã khóa' : 'Đang mở'}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => {
                                                        handleShowMembersModal(council.id);
                                                        setSelectedCouncil(council);
                                                    }}
                                                >
                                                    Thành viên
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => handleShowUpdateModal(council)}
                                                >
                                                    Cập nhật
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(council.id)}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="14">Không có dữ liệu hội đồng</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal thành viên của hội đồng */}
            <Modal show={showMembersModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thành viên của hội đồng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {members && members.length > 0 ? (
                        <>
                            <table className="members-table">
                                <thead>
                                    <tr>
                                        <th>Tên giảng viên</th>
                                        <th>Vai trò</th>
                                        <th>Sửa</th>
                                        <th>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.id}>
                                            <td>{member.full_name}</td>
                                            <td>{member.position}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => handleShowUpdateMemberModal(member)}
                                                >
                                                    Sửa
                                                </button>
                                            </td>
                                            <td>
                                                {(member.position === 'Thành viên 01' ||
                                                    member.position === 'Thành viên 02') && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleDeleteMember(member.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {members.length < 5 && (
                                <Button variant="primary" onClick={handleAddMembersClick}>
                                    +
                                </Button>
                            )}
                            {showAddMemberInputs && (
                                <>
                                    {members.length === 3 && (
                                        <Form.Group controlId="formMember01">
                                            <Form.Label>Thành viên 01</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Chọn thành viên 01"
                                                value={selectedMember01?.full_name || ''}
                                                onClick={handleMember01InputClick}
                                                readOnly
                                            />
                                            {showMember01List && (
                                                <div className="select-list">
                                                    {lecturers.map((lecturer) => (
                                                        <div
                                                            key={lecturer.user}
                                                            className="select-item"
                                                            onClick={() => {
                                                                setSelectedMember01(lecturer);
                                                                setShowMember01List(false);
                                                            }}
                                                        >
                                                            {lecturer.full_name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Form.Group>
                                    )}
                                    {members.length <= 4 && (
                                        <Form.Group controlId="formMember02">
                                            <Form.Label>Thành viên 02</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Chọn thành viên 02"
                                                value={selectedMember02?.full_name || ''}
                                                onClick={handleMember02InputClick}
                                                readOnly
                                            />
                                            {showMember02List && (
                                                <div className="select-list">
                                                    {lecturers.map((lecturer) => (
                                                        <div
                                                            key={lecturer.user}
                                                            className="select-item"
                                                            onClick={() => {
                                                                setSelectedMember02(lecturer);
                                                                setShowMember02List(false);
                                                            }}
                                                        >
                                                            {lecturer.full_name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Form.Group>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <p>Không có thành viên nào.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    {showAddMemberInputs && (
                        <Button variant="primary" onClick={handleAddMember}>
                            Thêm
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Modal cật nhật thành viên của hội đồng */}
            <Modal show={showUpdateMemberModal} onHide={handleCloseUpdateMemberModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Sửa thành viên của hội đồng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formLecturer">
                            <Form.Label>Giảng viên - Vai trò {memberUpdate?.position}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Chọn giảng viên"
                                value={selectedUpdateMember?.full_name || ''}
                                onClick={handleUpdateMemberInputClick}
                                readOnly
                            />
                            {showMemberUpdateList && (
                                <div className="select-list">
                                    {lecturers.map((lecturer) => (
                                        <div
                                            key={lecturer.user}
                                            className="select-item"
                                            onClick={() => {
                                                setSelectedUpdateMember(lecturer);
                                                setShowMemberUpdateList(!showMemberUpdateList);
                                            }}
                                        >
                                            {lecturer.full_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleUpdateMember}>
                        Cập nhật
                    </Button>
                    <Button variant="secondary" onClick={handleCloseUpdateMemberModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal cập nhật hội đồng */}
            <Modal show={showUpdateModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật hội đồng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Tên hội đồng</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedCouncil?.name || ''}
                                onChange={(e) => setSelectedCouncil({ ...selectedCouncil, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedCouncil?.description || ''}
                                onChange={(e) =>
                                    setSelectedCouncil({ ...selectedCouncil, description: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group controlId="formStatus">
                            <Form.Label>Trạng thái (Mở)</Form.Label>
                            <Form.Check
                                type="checkbox"
                                checked={selectedCouncil?.is_lock || false}
                                onChange={(e) => setSelectedCouncil({ ...selectedCouncil, is_lock: e.target.checked })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleUpdateCouncil}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa hội đồng này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteCouncil}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteMemberModal} onHide={() => setShowDeleteMemberModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa thành viên này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteMemberModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteMember}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal thêm hội đồng */}
            <Modal show={showAddModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm hội đồng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Form>
                            <Form.Group controlId="formName">
                                <Form.Label>Tên hội đồng</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tên hội đồng"
                                    onChange={(e) => setCouncilName(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="formDescription">
                                <Form.Label>Mô tả</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Mô tả"
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPresident">
                                <Form.Label>Chủ tịch</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Chọn chủ tịch"
                                    value={selectedPresident?.full_name || ''}
                                    onClick={handlePresidentInputClick}
                                    readOnly
                                />
                                {showPresidentList && (
                                    <div className="select-list">
                                        {lecturers.map((lecturer) => (
                                            <div
                                                key={lecturer.user}
                                                className="select-item"
                                                onClick={() => {
                                                    setSelectedPresident(lecturer);
                                                    setShowPresidentList(!showPresidentList);
                                                }}
                                            >
                                                {lecturer.full_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>
                            <Form.Group controlId="formSecretary">
                                <Form.Label>Thư ký</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Chọn thư ký"
                                    value={selectedSecretary?.full_name || ''}
                                    onClick={handleSecretaryInputClick}
                                    readOnly
                                />
                                {showSecretaryList && (
                                    <div className="select-list">
                                        {lecturers.map((lecturer) => (
                                            <div
                                                key={lecturer.user}
                                                className="select-item"
                                                onClick={() => {
                                                    setSelectedSecretary(lecturer);
                                                    setShowSecretaryList(!showSecretaryList);
                                                }}
                                            >
                                                {lecturer.full_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>
                            <Form.Group controlId="formReviewer">
                                <Form.Label>Phản biện</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Chọn phản biện"
                                    value={selectedReviewer?.full_name || ''}
                                    onClick={handleReviewerInputClick}
                                    readOnly
                                />
                                {showReviewerList && (
                                    <div className="select-list">
                                        {lecturers.map((lecturer) => (
                                            <div
                                                key={lecturer.user}
                                                className="select-item"
                                                onClick={() => {
                                                    setSelectedReviewer(lecturer);
                                                    setShowReviewerList(!showReviewerList);
                                                }}
                                            >
                                                {lecturer.full_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>
                            <Button variant="secondary" onClick={handleAddMembersClick}>
                                +
                            </Button>

                            {showMemberFields && (
                                <>
                                    <Form.Group controlId="formMember01">
                                        <Form.Label>Thành viên 01</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Chọn thành viên 01"
                                            value={selectedMember01?.full_name || ''}
                                            onClick={handleMember01InputClick}
                                            readOnly
                                        />
                                        {showMember01List && (
                                            <div className="select-list">
                                                {lecturers.map((lecturer) => (
                                                    <div
                                                        key={lecturer.user}
                                                        className="select-item"
                                                        onClick={() => {
                                                            setSelectedMember01(lecturer);
                                                            setShowMember01List(false);
                                                        }}
                                                    >
                                                        {lecturer.full_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Form.Group>
                                    <Form.Group controlId="formMember02">
                                        <Form.Label>Thành viên 02</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Chọn thành viên 02"
                                            value={selectedMember02?.full_name || ''}
                                            onClick={handleMember02InputClick}
                                            readOnly
                                        />
                                        {showMember02List && (
                                            <div className="select-list">
                                                {lecturers.map((lecturer) => (
                                                    <div
                                                        key={lecturer.user}
                                                        className="select-item"
                                                        onClick={() => {
                                                            setSelectedMember02(lecturer);
                                                            setShowMember02List(false);
                                                        }}
                                                    >
                                                        {lecturer.full_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Form.Group>
                                </>
                            )}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleAddCouncil}>
                        Thêm hội đồng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Councils;
