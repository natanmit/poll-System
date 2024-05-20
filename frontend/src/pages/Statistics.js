/* eslint-disable react-hooks/exhaustive-deps */
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { useGetStatisticsQuery } from "../redux/api/statisticAPI";
import { useEffect, useState } from "react";
import FullScreenLoader from "../components/FullScreenLoader";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController
);

const Statistics = () => {
    const { data: statistics, isLoading, refetch } = useGetStatisticsQuery();
    const [xAxis, setXAxis] = useState([]);
    const [first, setFirst] = useState([]);
    const [second, setSecond] = useState([]);
    const [third, setThird] = useState([]);
    const [fourth, setFourth] = useState([]);

    useEffect(() => {
        if (statistics && statistics.length > 0) {
            const xAxisList = statistics.map(statistic => statistic.title);
            const firstList = statistics.map(statistic => statistic.options[0].count);
            const secondList = statistics.map(statistic =>
                statistic.options.length > 1 ? statistic.options[1].count : null
            );
            const thirdList = statistics.map(statistic =>
                statistic.options.length > 2 ? statistic.options[2].count : null
            );
            const fourthList = statistics.map(statistic =>
                statistic.options.length > 3 ? statistic.options[3].count : null
            );

            setXAxis(xAxisList);
            setFirst(firstList);
            setSecond(secondList);
            setThird(thirdList);
            setFourth(fourthList);
        }
    }, [statistics]);

    useEffect(() => {
        refetch();
    }, []);


    const data = {
        labels: xAxis,
        datasets: [
            {
                label: 'First Answer',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                data: first,
            },
            {
                label: 'Second Answer', // Updated data series
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: second, // Data for the second series
            },
            {
                label: 'Third Answer', // Updated data series
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                data: third,
            },
            {
                label: 'Fourth Answer', // Updated data series
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                data: fourth, // Data for the fourth series
            },
        ],
    };


    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };
    return (
        <>
            {isLoading ? (<FullScreenLoader />) : (
                <div className='overflow-hidden main'>
                    <div className="container">
                        <div className="chart-container mt-5">
                            <Bar
                                data={data}
                                options={{
                                    ...options,
                                    maintainAspectRatio: false
                                }}
                            />
                        </div>
                    </div>


                </div>
            )}
        </>

    )
}

export default Statistics;