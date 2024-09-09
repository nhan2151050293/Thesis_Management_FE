import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import APIs, { endpoints } from '../../configs/APIs';
import './Statistical.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(
    CategoryScale, // Thang đo cho các biểu đồ cột và đường
    LinearScale, // Thang đo cho các trục
    BarElement, // Phần tử cột
    Title, // Tiêu đề biểu đồ
    Tooltip, // Gợi ý
    Legend, // Chú giải
    ArcElement, // Phần tử hình tròn cho biểu đồ pie
);

const Statistical = () => {
    const navigate = useNavigate();
    const [avgScores, setAvgScores] = useState([]);
    const [theses, setThese] = useState([]);
    const [selectedView, setSelectedView] = useState('avgScores');
    const [thesesChartData, setThesesChartData] = useState([]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await APIs.get(endpoints.stats, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(response.data);
            if (response.status === 200) {
                setAvgScores(response.data.avg_score_by_school_year);
                setThese(response.data.thesis_major_count);

                const chartData = response.data.thesis_major_count.map((item) => ({
                    name: item.major_name,
                    count: item.thesis_count,
                    backgroundColor: generateRandomColor(),
                }));
                setThesesChartData(chartData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chartConfig = {
        backgroundColor: '#747958',
        color: () => '#747958',
        strokeWidth: 2,
    };

    const generateRandomColor = () => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor.padStart(6, '0')}`;
    };

    const toggleView = (value) => {
        setSelectedView(value);
    };

    const barChartData = {
        labels: avgScores.map((item) => `${item.start_year}-${item.end_year}`),
        datasets: [
            {
                data: avgScores.map((item) => item.avg_score),
            },
        ],
    };

    const pieChartData = {
        labels: thesesChartData.map((item) => item.name),
        datasets: [
            {
                data: thesesChartData.map((item) => item.count),
                backgroundColor: thesesChartData.map((item) => item.backgroundColor),
            },
        ],
    };

    return (
        <div className="container">
            <div className="topBackground">
                <h1>THỐNG KÊ</h1>
            </div>
            <div className="radioContainer">
                <div className="radioButton">
                    <input
                        type="radio"
                        id="avgScores"
                        name="view"
                        value="avgScores"
                        checked={selectedView === 'avgScores'}
                        onChange={() => toggleView('avgScores')}
                    />
                    <label htmlFor="avgScores" className={selectedView === 'avgScores' ? 'selectedText' : ''}>
                        Điểm khóa luận qua từng năm
                    </label>
                </div>
                <div className="radioButton">
                    <input
                        type="radio"
                        id="theses"
                        name="view"
                        value="theses"
                        checked={selectedView === 'theses'}
                        onChange={() => toggleView('theses')}
                    />
                    <label htmlFor="theses" className={selectedView === 'theses' ? 'selectedText' : ''}>
                        Tần xuất tham gia làm khóa luận của từng ngành
                    </label>
                </div>
            </div>
            {selectedView === 'avgScores' ? (
                <div className="stats-container">
                    <div className="stats-table">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Năm học</th>
                                    <th>Điểm trung bình</th>
                                </tr>
                            </thead>
                            <tbody>
                                {avgScores.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            {item.start_year} - {item.end_year}
                                        </td>
                                        <td>{item.avg_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="stats-chart">
                        <Bar data={barChartData} options={chartConfig} />
                    </div>
                </div>
            ) : (
                <div className="stats-container">
                    <div className="stats-table">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ngành học</th>
                                    <th>Số khóa luận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {theses.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.major_name}</td>
                                        <td>{item.thesis_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="stats-chart">
                        <Pie data={pieChartData} options={chartConfig} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statistical;
