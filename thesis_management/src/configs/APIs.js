import axios from 'axios';

const BASE_URL = 'http://192.168.2.201:8000/';

export const endpoints = {
    users: '/users/',
    login: '/o/token/',
    'current-user': '/users/current-user/',
    'thesis-by-user-student': (userthese) => `/theses/${userthese}/`,
    'thesis-by-user-lecturer': (userId) => `/lecturers/${userId}/theses/`,
    'thesis-by-user-reviewer': (userId) => `/lecturers/${userId}/theses_review/`,
    'Council-by-user-lecturer': (userId) => `/lecturers/${userId}/councils/`,
    'council-members': (council_Id) => `/councils/${council_Id}/members/`,
    'council-theses': (council_Id) => `/councils/${council_Id}/theses/`,
    theses: '/theses/',
    'update-thesis': (thesis_code) => `/theses/${thesis_code}/`,
    'delete-thesis': (thesis_code) => `/theses/${thesis_code}/`,
    lecturers: '/lecturers/',
    'delete-lecturer': (lecturer_id) => `/lecturers/${lecturer_id}/`,
    'update-lecturer': (lecturer_id) => `/lecturers/${lecturer_id}/`,
    positions: '/positions/',
    students: '/students/',
    'delete-student': (student_id) => `/students/${student_id}/`,
    'update-student': (student_id) => `/students/${student_id}/`,
    'update-council': (council_id) => `/councils/${council_id}/`,
    'delete-council': (council_id) => `/councils/${council_id}/`,
    councils: '/councils/',
    council_details: '/council_details/members/',
    council_details_id: '/council_details/',
    'update-council-detail': (council_detail_id) => `/council_details/${council_detail_id}/`,
    'delete-council-detail': (council_detail_id) => `/council_details/${council_detail_id}/`,
    posts: '/posts/',
    criterias: '/criterias/',
    thesis_criterias: '/thesiscriterias/add/',
    'theses-criteria': (thesisCode) => `/theses/${thesisCode}/criteria/`,
    'these_lecturer-scores': (thesisCode) => `/theses/${thesisCode}/lecturer-scores/`,
    'these_generate-pdf': (thesisCode) => `/theses/${thesisCode}/generate-pdf/`,
    score: '/scores/',
    score_id: (id) => `/scores/${id}/`,
    like: (id) => `/posts/${id}/like/`,
    comments: (id) => `/posts/${id}/comments/`,
    commentsPost: (id) => `/posts/${id}/comment/`,
    delPost: (id) => `/posts/${id}/`,
    commentsDP: (id) => `/comments/${id}/`,
    stats: '/stats/',
    majors: '/majors/',
    school_years: '/school_years/',
    faculties: '/faculties/',
};

export const authApi = (accessToken) =>
    axios.create({
        baseURL: BASE_URL,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

export default axios.create({
    baseURL: BASE_URL,
});
