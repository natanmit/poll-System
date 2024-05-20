/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Row } from 'reactstrap';
import sideImg from '../assets/images/side-img.png';
import particalImg from '../assets/images/partical_2.png';
import { useGetQuestionsQuery } from '../redux/api/questionAPI';
import { useEffect, useState } from 'react';
import FullScreenLoader from '../components/FullScreenLoader';
import { useCreatePollMutation } from '../redux/api/pollAPI';
import { toast } from 'react-toastify';

const Home = () => {

    const [page, setPage] = useState(1);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const queryParams = {
        page: page,
    };
    const { data: questions, isLoading, refetch } = useGetQuestionsQuery(queryParams);
    const [createPoll, { isLoading: pollLoading, isSuccess, error, isError, data }] = useCreatePollMutation();

    useEffect(() => {
        refetch();
    }, []);

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message);
        }
        if (isError) {
            if (isSuccess && data?.message) {
                toast.success(data.message);
            } else if (isError && error?.data) {
                const errorMessage = typeof error.data === 'string' ? error.data : error.data?.message; 
                toast.error(errorMessage || 'An unknown error occurred', {
                    position: 'top-right',
                });
                console.error('Error:', errorMessage);
            }
        }
    }, [pollLoading]);


    const handlePrevious = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    // Go to the next page, if possible
    const handleNext = () => {
        if (page < questions.totalCount) { // Assuming totalPages is provided by your API
            setPage(prevPage => prevPage + 1);
        }
    };

    // Handle Radio Change
    const handleRadioChange = (event, questionId) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: event.target.value,
        });
    };

    // Handle Vote Click
    const handleVote = (questionId) => {
        const answer = selectedAnswers[questionId];
        const data = {};
        if (answer) {
            console.log('Voting for question ID:', questionId, 'with answer:', answer);
            data.question = questionId;
            data.selectedAnswer = answer;
        } else {
            console.log('No answer selected for question ID:', questionId);
            data.question = questionId;
        }
        createPoll(data);
    };

    return (
        <>
            {isLoading ? (<FullScreenLoader />) : questions && questions.questions.length > 0 ? (
                <>
                    <div className='overflow-hidden main'>
                        <Row className='h-100'>
                            <Col md={5} className='slideup side order-c'>
                                <div className="side-inner">
                                    <img src={sideImg} alt="sideimage" />
                                </div>
                            </Col>
                            <Col md={7} className='slidedown h-100'>
                                <div className="wrapper">
                                    <div className="show-section h-100">
                                        <div className="steps">
                                            <div className="step-count">Question {page} / {questions.totalCount}</div>
                                            {questions.questions.map((question, index) => (
                                                <div key={question._id /* assuming each question has a unique _id property */}>
                                                    <h2 className="main-heading">{question.title}</h2>
                                                    <div className="line-break"></div>
                                                    <fieldset className="answers">
                                                        {['firstAnswer', 'secondAnswer', 'thirdAnswer', 'fourthAnswer'].map((answerKey) => (
                                                            <div className="radiofield revealfield" key={answerKey}>
                                                                <input
                                                                    type="radio"
                                                                    id={`${question._id}-${answerKey}`}
                                                                    name={`answer-${question._id}`}
                                                                    value={answerKey}
                                                                    onChange={(e) => handleRadioChange(e, question._id)}
                                                                />
                                                                <label htmlFor={`${question._id}-${answerKey}`}>{question[answerKey]}</label>
                                                            </div>
                                                        ))}
                                                    </fieldset>
                                                    <div className="vote-button">
                                                        <button type="button" className="prev" onClick={() => handleVote(question._id)}>
                                                            Vote now
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="next-prev-button">
                                                {/* Disable "Previous Question" if the current page is the first one */}
                                                <Button color='light' className="prev" onClick={handlePrevious} disabled={page <= 1}>
                                                    Previous Question
                                                </Button>

                                                {/* Disable "Next Question" if the current page is the last one */}
                                                <Button className="next" onClick={handleNext} disabled={page >= questions.totalCount || questions.questions.length === 0}>
                                                    Next Question
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div><div className="bg-partical-2">
                        <img src={particalImg} alt="Partical" />
                    </div>
                </>
            ) : (
                <div className="d-flex justify-content-center mt-2">
                    <p>No Results</p>
                </div>
            )}

        </>
    )
}

export default Home;