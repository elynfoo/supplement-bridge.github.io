import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Quiz.css';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function Quiz({ onSubmit, loading }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizLoading, setQuizLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/quiz`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to load quiz:', err);
      alert('Failed to load quiz. Please try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  if (quizLoading) {
    return <div className="quiz-container"><h2>Loading quiz...</h2></div>;
  }

  if (questions.length === 0) {
    return <div className="quiz-container"><h2>No quiz questions available</h2></div>;
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <p>{currentQuestion + 1} of {questions.length}</p>
      </div>

      <div className="quiz-content">
        <h2>{question.question}</h2>
        <div className="quiz-options">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-button ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
              onClick={() => handleSelectAnswer(option.value)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-buttons">
        <button className="btn-secondary" onClick={handleBack} disabled={currentQuestion === 0}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={answers[currentQuestion] === undefined || loading}
        >
          {isLastQuestion ? (loading ? 'Submitting...' : 'Get Recommendations') : 'Next >'}
        </button>
      </div>
    </div>
  );
}

