//string for information at bottom of page
const info = `This website is designed to simulate a Pomodoro Timer, a time management method based on 25-minute stretches of focused work broken by five-minute breaks. Adjust the timing to suit your requirements using the dedicated settings section.`;

//converts seconds to xx:xx format
function formatTime(seconds) {
  let min = Math.floor(seconds / 60);
  let sec = seconds % 60;
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}

const ACTIONS = {
  SETSESSIONTIME: "setSessionTime",
  SETBREAKTIME: "setBreakTime",
  SETPAUSED: "setPaused",
  RESET: "reset",
  TICK: "tick",
};

const initialState = {
  maxSessionLength: 1500, // 60 seconds * 25 minutes
  maxBreakLength: 300, // 60 seconds * 5 minutes
  sessionRemainder: 1500,
  isPaused: true,
  isBreak: false,
  breakSound: new Audio("./relax.mp3"),
  workSound: new Audio("./work.mp3"),
};

function reducer(state, { type, load }) {
  switch (type) {
    case ACTIONS.SETSESSIONTIME:
      if (load === "decrease") {
        if (state.maxSessionLength <= 60) return state; //if below zero return state as it
        return {
          ...state,
          maxSessionLength: state.maxSessionLength - 60, //otherwise, take off one minute
        };
      }
      return {
        //if not taking off a minute, must be adding a minute
        ...state,
        maxSessionLength: state.maxSessionLength + 60,
      };

    case ACTIONS.SETBREAKTIME:
      if (load === "decrease") {
        if (state.maxBreakLength <= 30) return state;
        return {
          ...state,
          maxBreakLength: state.maxBreakLength - 30,
        };
      }
      return {
        ...state,
        maxBreakLength: state.maxBreakLength + 30,
      };

    case ACTIONS.SETPAUSED:
      if (state.sessionRemainder != state.maxSessionLength)
        //if time has changed, reset back to max
        return {
          ...state,
          isPaused: !state.isPaused,
          sessionRemainder: state.maxSessionLength,
        };
      return {
        ...state,
        isPaused: !state.isPaused,
      };

    case ACTIONS.RESET:
      return initialState; //reset everything back to initial state on FACTORY RESET

    case ACTIONS.TICK:
      if (!state.isPaused) {
        //if not paused, remove a second
        const newSessionRemainder = state.sessionRemainder - 1;
        if (newSessionRemainder === 0) {
          //if at zero seconds then switch from break to work
          const isBreak = !state.isBreak;
          const sessionRemainder = isBreak
            ? state.maxBreakLength
            : state.maxSessionLength;
          isBreak ? state.breakSound.play() : state.workSound.play(); //and play proper sound
          return {
            ...state,
            isBreak,
            sessionRemainder,
          };
        }

        return {
          ...state,
          sessionRemainder: newSessionRemainder,
        };
      }
      return state;

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    //sets up tick interval rate at one second
    const timer = setInterval(() => {
      dispatch({ type: ACTIONS.TICK });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div id="container">
      <div id="nonSettings">
        <h4>Tabor's Timer</h4>
        <div id="timeDisplay">
          <h2 id="timerWords">{state.isBreak ? "Break" : "Work"}</h2>
          <h1>{formatTime(state.sessionRemainder)}</h1>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-lg"
          id="pauser"
          onClick={() => dispatch({ type: ACTIONS.SETPAUSED })}
        >
          {state.isPaused ? "Start" : "Reset"}
        </button>
      </div>
      <div id="settings">
        <h2>
          <u>Settings</u>
        </h2>
        <div id="sessionTimeManagement">
          <button
            type="button"
            class="btn btn-danger btn-sm"
            onClick={() =>
              dispatch({ type: ACTIONS.SETSESSIONTIME, load: "decrease" })
            }
          >
            -
          </button>
          <h2>{formatTime(state.maxSessionLength)}</h2>

          <button
            type="button"
            class="btn btn-success btn-sm"
            onClick={() =>
              dispatch({ type: ACTIONS.SETSESSIONTIME, load: "increase" })
            }
          >
            +
          </button>
        </div>
        <h4>Work</h4>
        <div id="breakTimeManagement">
          <button
            type="button"
            class="btn btn-danger btn-sm"
            onClick={() =>
              dispatch({ type: ACTIONS.SETBREAKTIME, load: "decrease" })
            }
          >
            -
          </button>
          <h2>{formatTime(state.maxBreakLength)}</h2>

          <button
            type="button"
            class="btn btn-success btn-sm"
            onClick={() =>
              dispatch({ type: ACTIONS.SETBREAKTIME, load: "increase" })
            }
          >
            +
          </button>
        </div>
        <h4>Break</h4>
        <button
          type="button"
          class="btn btn-lg btn-warning"
          id="resetButton"
          onClick={() => dispatch({ type: ACTIONS.RESET })}
        >
          FACTORY RESET
        </button>
      </div>
      <p id="info">{info}</p>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("App"));
