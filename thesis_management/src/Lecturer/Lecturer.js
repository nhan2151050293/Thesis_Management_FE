import React, { useContext, useState, useEffect } from "react";
import { Alert, Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MyUserContext } from "../configs/Contexts";
import { authApi, endpoints } from "../configs/APIs";
import moment from "moment";
import "./Lecturer.css";

const Lecturers = () => {
  const user = useContext(MyUserContext) || {};
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lecturerToDelete, setLecturerToDelete] = useState(null);

  // States for modals
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [newLecturer, setNewLecturer] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    gender: "Chọn giới tính",
    code: "",
    full_name: "",
    birthday: "",
    address: "",
    faculty: "Chọn khoa",
  });
  const [showFacultyList, setShowFacultyList] = useState(false);
  const [showGenderList, setShowGenderList] = useState(false);

  const loadLecturers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const api = authApi(token);
      const response = await api.get(endpoints["lecturers"]);
      setLecturers(response.data.results);
      setFilteredLecturers(response.data.results);
    } catch (error) {
      console.error(error);
      setError("Không thể tải danh sách giảng viên. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const api = authApi(token);
      const response = await api.get(endpoints["faculties"]);
      console.log(response);
      setFaculty(response.data);
    } catch (error) {
      console.error(error);
      setError("Không thể tải danh sách khoa. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLecturers();
    loadFaculty();
  }, []);

  const handleDelete = (lecturerId) => {
    setLecturerToDelete(lecturerId);
    setShowDeleteModal(true);
  };

  const confirmDeleteLecturer = async () => {
    if (lecturerToDelete) {
      try {
        const token = localStorage.getItem("token");
        const api = authApi(token);
        await api.delete(endpoints["delete-lecturer"](lecturerToDelete));
        loadLecturers();
        alert("Giảng viên đã được xóa thành công!");
      } catch (error) {
        console.error(error);
        alert("Không thể xóa giảng viên. Vui lòng thử lại sau.");
      } finally {
        setShowDeleteModal(false);
        setLecturerToDelete(null);
      }
    }
  };

  const handleShowUpdateModal = (lecturer) => {
    setSelectedLecturer(lecturer);
    setShowUpdateModal(true);
  };

  const handleShowAddModal = () => {
    setNewLecturer({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      gender: "Chọn giới tính",
      code: "",
      full_name: "",
      birthday: "",
      address: "",
      faculty: "Chọn khoa",
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setShowAddModal(false);
    setSelectedLecturer(null);
    setShowFacultyList(false); // Close department list on modal close
    setShowGenderList(false); // Close gender list on modal close
  };

  const handleUpdateLecturer = async () => {
    try {
      const token = localStorage.getItem("token");
      const api = authApi(token);

      const formData = new FormData();
      formData.append("user", selectedLecturer.user);
      formData.append("code", selectedLecturer.code);
      formData.append("full_name", selectedLecturer.full_name);
      formData.append("birthday", selectedLecturer.birthday);
      formData.append("address", selectedLecturer.address);

      await api.patch(
        endpoints["update-lecturer"](selectedLecturer.user),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      loadLecturers();
      alert("Cập nhật giảng viên thành công!");
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Cập nhật giảng viên thất bại. Vui lòng thử lại.");
    }
  };

  const handleAddLecturer = async () => {
    if (newLecturer.password !== newLecturer.confirmPassword) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const api = authApi(token);

      // Tạo đối tượng User
      const userFormData = new FormData();
      userFormData.append("username", newLecturer.username);
      userFormData.append("password", newLecturer.password); // Lưu ý: đã xóa khoảng trắng dư thừa
      userFormData.append("phone", newLecturer.phone);
      userFormData.append("gender", newLecturer.gender);
      userFormData.append("role", "lecturer");

      const userResponse = await api.post(endpoints["users"], userFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Tạo đối tượng Lecturer với User ID
      const userId = userResponse.data.id; // Xác minh rằng bạn nhận được ID người dùng

      const lecturerFormData = new FormData();
      lecturerFormData.append("user", userId); // Liên kết với người dùng đã tạo
      lecturerFormData.append("code", newLecturer.code);
      lecturerFormData.append("full_name", newLecturer.full_name);
      lecturerFormData.append("birthday", newLecturer.birthday);
      lecturerFormData.append("address", newLecturer.address);
      lecturerFormData.append("faculty", newLecturer.faculty);

      await api.post(endpoints["lecturers"], lecturerFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      loadLecturers();
      alert("Thêm giảng viên thành công!");
      handleCloseModal();
    } catch (error) {
      console.error(
        "Lỗi thêm giảng viên:",
        error.response?.data || error.message
      );
      if (error.response?.data) {
        console.error("Chi tiết lỗi từ server:", error.response.data);
      }
      alert(
        "Thêm giảng viên thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại."
      );
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = lecturers.filter(
      (lecturer) =>
        lecturer.full_name.toLowerCase().includes(query) ||
        lecturer.code.toLowerCase().includes(query) ||
        lecturer.address.toLowerCase().includes(query) ||
        lecturer.faculty.toLowerCase().includes(query)
    );
    setFilteredLecturers(filtered);
  };

  const handleFacultyInputClick = () => {
    setShowFacultyList(!showFacultyList);
  };

  const handleFacultySelect = (faculty) => {
    setNewLecturer({ ...newLecturer, faculty });
    setShowFacultyList(false);
  };

  const handleGenderInputClick = () => {
    setShowGenderList(!showGenderList);
  };

  const handleGenderSelect = (gender) => {
    setNewLecturer({ ...newLecturer, gender });
    setShowGenderList(false);
  };

  return (
    <div>
      <div className="lecturer-header">
        <h1 className="lecturer-title">Quản lý giảng viên</h1>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="lecturers-container">
        <div className="search-container">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm giảng viên..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button
            type="button"
            className="btn btn-primary add-btn"
            onClick={handleShowAddModal}
          >
            Thêm giảng viên
          </button>
        </div>
        <table className="lecturers-table">
          <thead>
            <tr>
              <th>Mã số giảng viên</th>
              <th>Họ và tên</th>
              <th>Ngày sinh</th>
              <th>Quê quán</th>
              <th>Khoa</th>
              <th>Cập nhật</th>
              <th>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {filteredLecturers.map((lecturer, index) => (
              <tr key={index}>
                <td>{lecturer.code}</td>
                <td>{lecturer.full_name}</td>
                <td>{moment(lecturer.birthday).format("DD/MM/YYYY")}</td>
                <td>{lecturer.address}</td>
                <td>{lecturer.faculty}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleShowUpdateModal(lecturer)}
                  >
                    Cập nhật
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(lecturer.user)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa giảng viên này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeleteLecturer}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal cập nhật giảng viên */}
      <Modal show={showUpdateModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật giảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCode">
              <Form.Label>Mã số giảng viên</Form.Label>
              <Form.Control
                type="text"
                value={selectedLecturer?.code || ""}
                onChange={(e) =>
                  setSelectedLecturer({
                    ...selectedLecturer,
                    code: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formFullName">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                value={selectedLecturer?.full_name || ""}
                onChange={(e) =>
                  setSelectedLecturer({
                    ...selectedLecturer,
                    full_name: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formBirthday">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                value={selectedLecturer?.birthday || ""}
                onChange={(e) =>
                  setSelectedLecturer({
                    ...selectedLecturer,
                    birthday: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formAddress">
              <Form.Label>Quê quán</Form.Label>
              <Form.Control
                type="text"
                value={selectedLecturer?.address || ""}
                onChange={(e) =>
                  setSelectedLecturer({
                    ...selectedLecturer,
                    address: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleUpdateLecturer}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thêm giảng viên */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm giảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUsername">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={newLecturer.username}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                value={newLecturer.password}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, password: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={newLecturer.confirmPassword}
                onChange={(e) =>
                  setNewLecturer({
                    ...newLecturer,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email"
                value={newLecturer.email}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formPhone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập số điện thoại"
                value={newLecturer.phone}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, phone: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formGender">
              <Form.Label>Giới tính</Form.Label>
              <Form.Control
                type="text"
                value={newLecturer.gender}
                onClick={handleGenderInputClick}
                readOnly
              />
              {showGenderList && (
                <div className="major-list">
                  <div
                    className="major-item"
                    onClick={() => handleGenderSelect("Nam")}
                  >
                    Nam
                  </div>
                  <div
                    className="major-item"
                    onClick={() => handleGenderSelect("Nữ")}
                  >
                    Nữ
                  </div>
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="formCode">
              <Form.Label>Mã số giảng viên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập mã số giảng viên"
                value={newLecturer.code}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, code: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formFullName">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ và tên"
                value={newLecturer.full_name}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, full_name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formBirthday">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                value={newLecturer.birthday}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, birthday: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formAddress">
              <Form.Label>Quê quán</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập quê quán"
                value={newLecturer.address}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, address: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formFaculty">
              <Form.Label>Khoa</Form.Label>
              <Form.Control
                type="text"
                value={newLecturer.faculty}
                onClick={handleFacultyInputClick}
                readOnly
              />
              {showFacultyList && (
                <div className="major-list">
                  {faculty.map((faculty, index) => (
                    <div
                      key={index}
                      className="major-item"
                      onClick={() => handleFacultySelect(faculty.code)}
                    >
                      {faculty.name}
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleAddLecturer}>
            Thêm giảng viên
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Lecturers;
