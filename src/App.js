import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.dark ? '#333' : '#fff'};
    color: ${props => props.dark ? '#fff' : '#333'};
    font-family: Arial, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
    position: relative;
  }

  .watermark {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    z-index: -1;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
`;

const Header = styled.h1`
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.cols}, 20px);
  grid-template-rows: repeat(${props => props.rows}, 20px);
  grid-gap: 1px;
  background-color: ${props => props.dark ? '#666' : '#ddd'};
  border: 5px solid ${props => props.dark ? '#fff' : '#333'};
`;

const Cell = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${props => props.color};
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const HeadCell = styled(Cell)`
  background-color: ${props => props.color};
  border-radius: 50%;
`;

const ArrowKeysContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 5px;
`;

const ArrowKey = styled(Button)`
  background-color: #ccc;
  color: #333;
  font-size: 20px;
  padding: 5px 10px;
  margin: 5px;
`;

const Watermark = () => <div className="watermark">Created by Vici</div>;

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : true;
  });
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(20);
  const [snake, setSnake] = useState([[0,0]]);
  const [direction, setDirection] = useState('RIGHT');
  const [food, setFood] = useState([Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)]);
  const [gameOver, setGameOver] = useState(false);
  const [pause, setPause] = useState(false);
  const [topScore, setTopScore] = useState(() => {
    const storedScore = localStorage.getItem('topScore');
    return storedScore ? parseInt(storedScore) : 0;
  });

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (!pause) {
      const interval = setInterval(moveSnake, 100);
      return () => clearInterval(interval);
    }
  }, [snake, pause]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleKeyPress = (event) => {
    if (!gameOver) {
      switch (event.keyCode) {
        case 37:
          setDirection('LEFT');
          break;
        case 38:
          setDirection('UP');
          break;
        case 39:
          setDirection('RIGHT');
          break;
        case 40:
          setDirection('DOWN');
          break;
        case 80: // Key code for 'P'
          setPause(prevPause => !prevPause);
          break;
        default:
          break;
      }
    }
  };

  const moveSnake = () => {
    if (!gameOver && !pause) {
      let newSnake = [...snake];
      let head = [newSnake[0][0], newSnake[0][1]];

      switch (direction) {
        case 'LEFT':
          head[1]--;
          break;
        case 'UP':
          head[0]--;
          break;
        case 'RIGHT':
          head[1]++;
          break;
        case 'DOWN':
          head[0]++;
          break;
        default:
          break;
      }

      // Check collision with wall or itself
      if (head[0] < 0 || head[0] >= rows || head[1] < 0 || head[1] >= cols || newSnake.find(cell => cell[0] === head[0] && cell[1] === head[1])) {
        setGameOver(true);
        updateTopScore();
        return;
      }

      newSnake.unshift(head);
      if (head[0] === food[0] && head[1] === food[1]) {
        generateFood();
      } else {
        newSnake.pop();
      }
      setSnake(newSnake);
    }
  };

  const generateFood = () => {
    setFood([Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)]);
  };

  const restartGame = () => {
    setSnake([[0,0]]);
    setDirection('RIGHT');
    setFood([Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)]);
    setGameOver(false);
    setPause(false);
  };

  const updateTopScore = () => {
    if (snake.length - 1 > topScore) {
      setTopScore(snake.length - 1);
      localStorage.setItem('topScore', snake.length - 1);
    }
  };

  return (
    <>
      <GlobalStyle dark={darkMode} />
      <Container>
        <Header>Snake Game</Header>
        <p>Top Score: {topScore}</p>
        <div>
          <Grid rows={rows} cols={cols} dark={darkMode}>
            {Array(rows * cols).fill().map((_, index) => {
              const rowIndex = Math.floor(index / cols);
              const colIndex = index % cols;
              let color = 'transparent';
              if (food[0] === rowIndex && food[1] === colIndex) {
                color = 'red';
              } else if (snake.find(cell => cell[0] === rowIndex && cell[1] === colIndex)) {
                color = 'blue'; // Changing snake color to blue
              }
              return rowIndex === snake[0][0] && colIndex === snake[0][1] ? <HeadCell key={index} color={color} /> : <Cell key={index} color={color} />;
            })}
          </Grid>
          {gameOver && (
            <div>
              <p>Game Over!</p>
              <Button onClick={restartGame}>Restart</Button>
            </div>
          )}
          <ArrowKeysContainer>
            <div></div>
            <ArrowKey onClick={() => setDirection('UP')}>↑</ArrowKey>
            <div></div>
            <ArrowKey onClick={() => setDirection('LEFT')}>←</ArrowKey>
            <ArrowKey onClick={() => setDirection('DOWN')}>↓</ArrowKey>
            <ArrowKey onClick={() => setDirection('RIGHT')}>→</ArrowKey>
            <div></div>
            <ArrowKey onClick={() => setPause(!pause)}>{pause ? 'Resume' : 'Pause'}</ArrowKey>
            <div></div>
          </ArrowKeysContainer>
        </div>
      </Container>
      <Watermark />
    </>
  );
};

export default App;
