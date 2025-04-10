import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, ChevronRight, Gamepad2, Wallet, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { DepositFundsDialog } from "@/components/funds/deposit-funds-dialog";

type Game = {
  id: number;
  name: string;
  description: string;
  reward: number;
  difficulty: "easy" | "medium" | "hard";
  icon: React.ReactNode;
};

// Number guessing game component
function NumberGuessingGame({ onWin }: { onWin: (reward: number) => void }) {
  const [target, setTarget] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const maxAttempts = 5;
  const reward = 25;

  useEffect(() => {
    // Generate a random number between 1 and 100
    setTarget(Math.floor(Math.random() * 100) + 1);
  }, []);

  const handleGuess = () => {
    const userGuess = parseInt(guess);
    
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
      setMessage("Please enter a valid number between 1 and 100");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (userGuess === target) {
      setMessage(`Congratulations! You guessed the number in ${newAttempts} attempts.`);
      setGameState("won");
      onWin(reward);
    } else if (newAttempts >= maxAttempts) {
      setMessage(`Game over! The number was ${target}.`);
      setGameState("lost");
    } else if (userGuess < target) {
      setMessage(`Try higher! Attempts: ${newAttempts}/${maxAttempts}`);
    } else {
      setMessage(`Try lower! Attempts: ${newAttempts}/${maxAttempts}`);
    }

    setGuess("");
  };

  const resetGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setAttempts(0);
    setMessage("");
    setGameState("playing");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Number Guessing Game</h2>
      <p className="text-center text-white/70">
        {gameState === "playing" 
          ? `Guess a number between 1 and 100. You have ${maxAttempts - attempts} attempts left.` 
          : message
        }
      </p>
      
      {gameState === "playing" && (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="flex-1 p-2 rounded bg-black/30 border border-white/20 text-white"
            placeholder="Enter your guess"
            min={1}
            max={100}
          />
          <Button onClick={handleGuess} className="cyberpunk-button">
            Guess
          </Button>
        </div>
      )}
      
      {message && gameState === "playing" && (
        <p className="text-center text-primary-500">{message}</p>
      )}
      
      {gameState !== "playing" && (
        <Button onClick={resetGame} className="w-full cyberpunk-button">
          Play Again
        </Button>
      )}
    </div>
  );
}

// Market Quiz component
function MarketQuizGame({ onWin }: { onWin: (reward: number) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const reward = 50;

  const questions = [
    {
      questionText: 'What does P/E ratio stand for?',
      answerOptions: [
        { answerText: 'Price to Earnings', isCorrect: true },
        { answerText: 'Profit to Expense', isCorrect: false },
        { answerText: 'Potential Earnings', isCorrect: false },
        { answerText: 'Public Equity', isCorrect: false },
      ],
    },
    {
      questionText: 'Which of these is NOT a major stock index?',
      answerOptions: [
        { answerText: 'Dow Jones Industrial Average', isCorrect: false },
        { answerText: 'NASDAQ Composite', isCorrect: false },
        { answerText: 'S&P 500', isCorrect: false },
        { answerText: 'FTXM 100', isCorrect: true },
      ],
    },
    {
      questionText: 'What is a "bull market"?',
      answerOptions: [
        { answerText: 'A market dominated by falling prices', isCorrect: false },
        { answerText: 'A market dominated by rising prices', isCorrect: true },
        { answerText: 'A market with high volatility', isCorrect: false },
        { answerText: 'A market for trading livestock', isCorrect: false },
      ],
    },
    {
      questionText: 'What is a dividend?',
      answerOptions: [
        { answerText: 'A type of investment strategy', isCorrect: false },
        { answerText: 'The minimum investment amount', isCorrect: false },
        { answerText: 'A payment made by corporations to shareholders', isCorrect: true },
        { answerText: 'The fee charged for selling a stock', isCorrect: false },
      ],
    },
  ];
  
  const handleAnswerClick = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      if (score + (isCorrect ? 1 : 0) >= 3) {
        onWin(reward);
      }
      setShowScore(true);
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };
  
  return (
    <div className="space-y-4">
      {showScore ? (
        <div className="text-center py-4 space-y-6">
          <h3 className="text-xl font-bold">
            You scored {score} out of {questions.length}
          </h3>
          
          {score >= 3 ? (
            <div className="py-4">
              <p className="text-green-400 text-lg font-semibold">Congratulations! You won ${reward}!</p>
              <p className="text-white/70 text-sm mt-2">Your investment knowledge is impressive!</p>
            </div>
          ) : (
            <p className="text-white/70">
              You need at least 3 correct answers to win the reward. Try again!
            </p>
          )}
          
          <Button onClick={resetQuiz} className="cyberpunk-button">
            Play Again
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="text-sm text-white/50 mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <h3 className="text-xl font-medium">{questions[currentQuestion].questionText}</h3>
          </div>
          
          <div className="space-y-3">
            {questions[currentQuestion].answerOptions.map((option, index) => (
              <Button 
                key={index} 
                onClick={() => handleAnswerClick(option.isCorrect)}
                className="w-full text-left justify-start glass border border-white/20 hover:bg-white/10"
              >
                {option.answerText}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Coin flip game component
function CoinFlipGame({ onWin }: { onWin: (reward: number) => void }) {
  const [result, setResult] = useState<string | null>(null);
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const reward = 10;

  const flipCoin = (choice: string) => {
    setUserChoice(choice);
    setIsSpinning(true);
    
    // Simulate coin flip animation
    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? "heads" : "tails";
      setResult(outcome);
      setIsSpinning(false);
      
      if (choice === outcome) {
        onWin(reward);
      }
    }, 1500);
  };

  const resetGame = () => {
    setResult(null);
    setUserChoice(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Coin Flip</h2>
      <p className="text-center text-white/70">
        Choose heads or tails and flip the coin
      </p>
      
      {result === null ? (
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => flipCoin("heads")} 
            disabled={isSpinning} 
            className={`w-24 ${isSpinning ? 'opacity-50' : 'cyberpunk-button'}`}
          >
            Heads
          </Button>
          <Button 
            onClick={() => flipCoin("tails")} 
            disabled={isSpinning} 
            className={`w-24 ${isSpinning ? 'opacity-50' : 'cyberpunk-button'}`}
          >
            Tails
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-2xl font-bold">
            {isSpinning ? "Flipping..." : `Result: ${result}`}
          </div>
          {!isSpinning && (
            <div className="text-lg">
              {userChoice === result ? (
                <span className="text-green-400">You won ${reward}!</span>
              ) : (
                <span className="text-red-400">Better luck next time!</span>
              )}
            </div>
          )}
          {!isSpinning && (
            <Button onClick={resetGame} className="cyberpunk-button">
              Flip Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Memory match game component
function MemoryMatchGame({ onWin }: { onWin: (reward: number) => void }) {
  const [cards, setCards] = useState<Array<{ id: number, value: string, flipped: boolean, matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const reward = 30;
  
  // Initialize cards
  useEffect(() => {
    const symbols = ['💰', '📈', '💎', '🚀', '🏦', '💵', '🔑', '⚡'];
    const cardValues = [...symbols, ...symbols];
    const shuffled = cardValues.sort(() => Math.random() - 0.5);
    
    setCards(shuffled.map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false
    })));
    
    setFlippedCards([]);
    setMoves(0);
    setGameComplete(false);
  }, []);
  
  useEffect(() => {
    // Check if we have two flipped cards
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      
      // Check if they match
      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Mark as matched
        setCards(cards.map((card, index) => 
          index === firstIndex || index === secondIndex
            ? { ...card, matched: true }
            : card
        ));
      }
      
      // After a brief delay, flip back any unmatched cards
      setTimeout(() => {
        setCards(cards.map((card, index) => 
          !card.matched && (index === firstIndex || index === secondIndex)
            ? { ...card, flipped: false }
            : card
        ));
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards, cards]);
  
  useEffect(() => {
    // Check if game is complete (all cards matched)
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setGameComplete(true);
      onWin(reward);
    }
  }, [cards, onWin, reward]);
  
  const handleCardClick = (index: number) => {
    // Ignore if two cards are already flipped or this card is already flipped/matched
    if (flippedCards.length === 2 || cards[index].flipped || cards[index].matched) {
      return;
    }
    
    // Flip this card
    setCards(cards.map((card, i) => 
      i === index ? { ...card, flipped: true } : card
    ));
    
    // Add to flipped cards
    setFlippedCards([...flippedCards, index]);
    
    // Increment moves if this is the second card flipped
    if (flippedCards.length === 1) {
      setMoves(moves + 1);
    }
  };
  
  const resetGame = () => {
    const symbols = ['💰', '📈', '💎', '🚀', '🏦', '💵', '🔑', '⚡'];
    const cardValues = [...symbols, ...symbols];
    const shuffled = cardValues.sort(() => Math.random() - 0.5);
    
    setCards(shuffled.map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false
    })));
    
    setFlippedCards([]);
    setMoves(0);
    setGameComplete(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Memory Match</h2>
        <div className="text-white/70">Moves: {moves}</div>
      </div>
      
      {gameComplete ? (
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">Game Complete!</p>
          <p className="text-green-400">You won ${reward} in {moves} moves!</p>
          <Button onClick={resetGame} className="cyberpunk-button">
            Play Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, index) => (
            <div 
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`aspect-square flex items-center justify-center text-3xl cursor-pointer transition-all transform ${
                card.flipped || card.matched ? 'bg-primary/20 rotate-0' : 'bg-dark-600 rotate-y-180'
              } rounded-lg ${!card.flipped && !card.matched ? 'hover:bg-dark-500' : ''}`}
            >
              {(card.flipped || card.matched) && card.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Word scramble game component
function WordScrambleGame({ onWin }: { onWin: (reward: number) => void }) {
  const [originalWord, setOriginalWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  const reward = 40;
  
  const financeWords = [
    "dividend", "portfolio", "investment", "stocks", "asset", 
    "broker", "capital", "equity", "market", "trading", 
    "finance", "wealth", "profit", "shares", "bull"
  ];
  
  useEffect(() => {
    startNewRound();
  }, []);
  
  function scrambleWord(word: string): string {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    // Make sure the scrambled word is different from the original
    const scrambled = letters.join('');
    return scrambled === word ? scrambleWord(word) : scrambled;
  }
  
  const startNewRound = () => {
    const randomWord = financeWords[Math.floor(Math.random() * financeWords.length)];
    setOriginalWord(randomWord);
    setScrambledWord(scrambleWord(randomWord));
    setUserGuess("");
    setFeedback("");
    setIsCorrect(false);
    setAttempts(0);
  };
  
  const handleSubmit = () => {
    if (userGuess.trim().toLowerCase() === originalWord.toLowerCase()) {
      setFeedback("Correct! Well done!");
      setIsCorrect(true);
      onWin(reward);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setFeedback(`Out of attempts. The word was "${originalWord}".`);
      } else {
        setFeedback(`Incorrect. Try again! (${maxAttempts - newAttempts} attempts left)`);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Word Scramble</h2>
      <p className="text-center text-white/70">
        Unscramble the financial term
      </p>
      
      <div className="my-6 bg-dark-600 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold tracking-wider">{scrambledWord.toUpperCase()}</div>
      </div>
      
      {!isCorrect && attempts < maxAttempts ? (
        <div className="space-y-4">
          <div className="flex">
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              className="flex-1 p-2 rounded-l bg-black/30 border border-white/20 text-white"
              placeholder="Enter your guess"
            />
            <Button 
              onClick={handleSubmit} 
              className="rounded-l-none cyberpunk-button"
            >
              Submit
            </Button>
          </div>
          
          {feedback && (
            <p className={`text-center ${feedback.includes("Correct") ? "text-green-400" : "text-red-400"}`}>
              {feedback}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          {isCorrect ? (
            <p className="text-green-400 text-lg">You won ${reward}!</p>
          ) : (
            <p className="text-red-400">{feedback}</p>
          )}
          
          <Button onClick={startNewRound} className="cyberpunk-button">
            Next Word
          </Button>
        </div>
      )}
    </div>
  );
}

export default function EarnPage() {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const games: Game[] = [
    {
      id: 1,
      name: "Number Guess",
      description: "Guess the number between 1-100",
      reward: 25,
      difficulty: "medium",
      icon: <Trophy className="h-10 w-10 text-yellow-400" />
    },
    {
      id: 2,
      name: "Coin Flip",
      description: "Guess heads or tails",
      reward: 10,
      difficulty: "easy",
      icon: <TrendingUp className="h-10 w-10 text-green-400" />
    },
    {
      id: 3,
      name: "Market Quiz",
      description: "Test your investment knowledge",
      reward: 50,
      difficulty: "hard",
      icon: <Gamepad2 className="h-10 w-10 text-blue-400" />
    },
    {
      id: 4,
      name: "Memory Match",
      description: "Match pairs of financial symbols",
      reward: 30,
      difficulty: "medium",
      icon: <Wallet className="h-10 w-10 text-purple-400" />
    },
    {
      id: 5,
      name: "Word Scramble",
      description: "Unscramble financial terms",
      reward: 40,
      difficulty: "hard",
      icon: <Trophy className="h-10 w-10 text-pink-400" />
    },
  ];

  const handleWin = (reward: number) => {
    setBalance(prevBalance => prevBalance + reward);
    toast({
      title: "Congratulations!",
      description: `You won $${reward}! It has been added to your balance.`,
    });
  };

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Earn Rewards</h1>
          <p className="text-white/60">Play games and earn money</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-3 rounded-lg mb-2">
            <span className="text-sm text-white/70">Balance</span>
            <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
          </div>
          {/* Deposit funds option removed as requested */}
        </div>
      </div>

      {selectedGame ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedGame(null)}
            className="mb-4 bg-transparent border-white/20"
          >
            ← Back to Games
          </Button>
          
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedGame.name}</CardTitle>
                <div className="px-3 py-1 bg-primary/20 rounded-full text-sm">
                  Reward: ${selectedGame.reward}
                </div>
              </div>
              <CardDescription>
                {selectedGame.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedGame.id === 1 && (
                <NumberGuessingGame onWin={handleWin} />
              )}
              {selectedGame.id === 2 && (
                <CoinFlipGame onWin={handleWin} />
              )}
              {selectedGame.id === 3 && (
                <MarketQuizGame onWin={handleWin} />
              )}
              {selectedGame.id === 4 && (
                <MemoryMatchGame onWin={handleWin} />
              )}
              {selectedGame.id === 5 && (
                <WordScrambleGame onWin={handleWin} />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="glass hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedGame(game)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="bg-black/30 p-3 rounded-lg">
                    {game.icon}
                  </div>
                  <div className="px-3 py-1 bg-primary/20 rounded-full text-sm">
                    {game.difficulty}
                  </div>
                </div>
                <CardTitle className="mt-2">{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <div className="text-white/70">
                  Reward: <span className="text-primary">${game.reward}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/50" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}