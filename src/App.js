import React from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Chip from '@material-ui/core/Chip';
import Badge from '@material-ui/core/Badge';
import CreateIcon from '@material-ui/icons/Create';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import Zoom from '@material-ui/core/Zoom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import green from '@material-ui/core/colors/green';

class StartOptions extends React.Component {

  render() {
    return (
      <div className="start-options">
        <Grid container direction="column" spacing={5} justify="center" alignItems="center">
          <Grid item>
            <Button 
              onClick={this.props.handleNewGame} 
              variant="contained" 
              color="primary" 
              size="large">
                Start New Game
            </Button>
          </Grid>
          <Grid item>
            <Button 
              onClick={this.props.handleJoinGame}
              variant="contained" 
              color="primary" 
              size="large">
                Join Game
            </Button>
          </Grid>
        </Grid>
      </div>
      
    );
  }
}

class ViewSentences extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sentences: [],
      intervalID: null,
      codeWasValid: false,
      showAuthors: false,
      currentSentence: 0
    };
  }

  makeSentencePapers() {
    let sentencePapers = Array();
    for (let sentence of this.state.sentences) {
      let sentencePaper;
      if (!this.state.showAuthors) {
        sentencePaper =
        <div className="single-response">
          <Typography variant="h5" align="center">
            {sentence.who.response.trim() + " " +
            sentence.what.response.trim() + " " +
            sentence.where.response.trim() + " " +
            sentence.why.response.trim()}
          </Typography>
        </div>;
      } else {
        sentencePaper =
        <>
          <div className="single-response">
            <Typography variant="h5" align="center">{sentence.who.response}</Typography>
            <Chip variant="outlined" size="small" label={sentence.who.name} color="primary"/>
          </div>
          
          <div className="single-response">
            <Typography variant="h5" align="center">{sentence.what.response}</Typography>
            <Chip variant="outlined" size="small" label={sentence.what.name} color="primary"/>
          </div>

          <div className="single-response">
            <Typography variant="h5" align="center">{sentence.where.response}</Typography>
            <Chip variant="outlined" size="small" label={sentence.where.name} color="primary"/>
          </div>

          <div className="single-response">
            <Typography variant="h5" align="center">{sentence.why.response}</Typography>
            <Chip variant="outlined" size="small" label={sentence.why.name} color="primary"/>
          </div></>;
      
    }
      sentencePapers.push(sentencePaper);
    }
    return(sentencePapers);
  }

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount() {
    clearTimeout(this.state.intervalID);
  }

  getData() {
    let body = JSON.stringify(
      {
        type: "get-game-state",
        code: this.props.gameCode
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from ViewSentences/getData');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.codeWasValid) {
            this.setState({codeWasValid: true});
            if (result.gameState.gameStage == "sentences-created") {
              this.setState({
                sentences: result.gameState.sentences,
                isLoaded: true
              });
              clearTimeout(this.state.intervalID);
            } else {
              let intervalID = setTimeout(this.getData.bind(this), 4000);
              this.setState({intervalID: intervalID});
            }
          } else {
            this.setState({codeWasValid: false});
          }
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          });
        }
      );
  }

  handleSwitch() {
    this.setState({showAuthors: !this.state.showAuthors});
  }

  navigate(i) {
    const newIndex = (this.state.currentSentence + i) % this.state.sentences.length;
    this.setState({currentSentence: newIndex});
  }

  render() {
    if (this.state.error) {
      return (<div>Error: {this.state.error.message}</div>);
    } else if (!this.state.isLoaded) {
      return(<div>Loading...</div>);
    } else {
      if (this.state.codeWasValid) {
        return(
          <div className="prompt-text">

              <div className="show-authors">
                <FormControlLabel 
                  control={
                    <Switch
                      checked={this.state.showAuthors}
                      onChange={() => this.handleSwitch()}
                      color="primary"
                    />
                  }
                  label="Show Authors"
                />
              </div>
              
              <div className="sentence">
                <div className="sentence-inside" >{this.makeSentencePapers()[this.state.currentSentence]}</div>
              </div>
              
              <div className="last-sentence">
                <IconButton color="primary" onClick={() => this.navigate(this.state.sentences.length - 1)}>
                  <NavigateBeforeIcon />
                </IconButton>
              </div>
              
              <div className="next-sentence">
                <IconButton color="primary" onClick={() => this.navigate(1)}>
                  <NavigateNextIcon />
                </IconButton>
              </div>
              


          </div>
        )
      } else {

      }
    }
  }
}

class FinishedResponses extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      isLoaded: false,
      codeWasValid: false,
      intervalID: null
    }
  }

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount() {
    clearTimeout(this.state.intervalID);
  }

  getSentences() {
    clearTimeout(this.state.intervalID);
    this.props.getSentences();
  }

  getData() {
    let body = JSON.stringify(
      {
        type: "get-game-state",
        code: this.props.gameCode
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from FinishedResponses/getData');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.codeWasValid) {
            if (result.gameState.gameStage == "all-players-waiting" || result.gameState.gameStage == 'sentences-created') {
              this.getSentences();
            } else {
              let intervalID = setTimeout(this.getData.bind(this), 4000);
              this.setState({
                players: result.gameState.players,
                intervalID: intervalID
              });
              if(!this.state.isLoaded) {
                this.setState({
                  isLoaded: true,
                  codeWasValid: true
                })
              }
            } 
          } else {
            this.setState({codeWasValid: false});
          }
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          });
        }
      );
  }

  createPlayers() {
    let players = Array();
    for (let player of this.state.players) {
      let icon;
      if (player.doneWithQuestions) {
        icon = <CheckCircleIcon/>
      } else {
        icon = <CreateIcon/>
      }
      players.push(
        <Grid item>
          <Chip icon={icon} label={player.name} color="primary"/>
        </Grid>
      );
    }
    return(players);
  }

  render() {
    
    if (this.state.error) {
      return (<div>Error: {this.state.error.message}</div>);
    } else if (!this.state.isLoaded) {
      return(<div>Loading...</div>);
    } else {
      if (this.state.codeWasValid) {
        return(
          <div className="prompt-text">
            <Grid container direction="column" spacing={5} justify="center" alignItems="center">
              <Grid item>
                <Typography variant="h4" align="center">
                  Waiting for all players to finish
                </Typography>
              </Grid>

              <Grid item>
                <Grid container direction="row" spacing={2} justify="center" alignItems="center">
                  {this.createPlayers()}
                </Grid>
              </Grid>

            </Grid>
          </div>
        );
      } else{
        return(
          <div className="prompt-text">
            <Grid container direction="column" spacing={4} justify="center" alignItems="center">
              <Grid item>
                <Typography variant="h5" align="center" >
                  looks like your game no longer exists
                </Typography>
              </Grid>
              <Grid item>
                <Button 
                  onClick={() => this.props.enterNewCode()}
                  variant="contained" 
                  color="primary">
                  Enter Another Code
                </Button>
              </Grid>           
            </Grid>
          </div>
        );
      }
    }
  }
}

class EnterResponses extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      response: {
        name: props.name,
        who: "",
        what: "",
        where: "",
        why: ""
      },
      currentQuestion: "who"
    }
  }

  handleResponseChange(e) {
    let response = {
      name: this.props.name,
      who: this.state.response.who,
      what: this.state.response.what,
      where: this.state.response.where,
      why: this.state.response.why
    };
    if (this.state.currentQuestion == "who") {
      response.who = e.target.value;
    } else if (this.state.currentQuestion == "what") {
      response.what = e.target.value;
    } else if (this.state.currentQuestion == "where") {
      response.where = e.target.value;
    } else if (this.state.currentQuestion == "why") {
      response.why = e.target.value;
    }
    this.setState({
      response: response
    })
  }

  handleNext() {
    if (this.state.currentQuestion == "who") {
      this.setState({currentQuestion: "what"});
    } else if (this.state.currentQuestion == "what") {
      this.setState({currentQuestion: "where"});
    } else if (this.state.currentQuestion == "where") {
      this.setState({currentQuestion: "why"});
    } else if (this.state.currentQuestion == "why") {
      this.props.sendResponse(this.state.response);
    }
  }

  render() {
    let question;
    let explanation;
    let example;
    let pronounStuff;
    let responseText;
    if (this.state.currentQuestion == "who") {
      responseText = this.state.response.who
      question = "WHO";
      explanation = "enter any person or animal etc";
      example = " eg. 'Obama' or 'Obama's dog, Bo'";
      pronounStuff = <div></div>;
    } else if (this.state.currentQuestion == "what") {
      responseText = this.state.response.what
      question = "WHAT";
      explanation = "enter an action";
      example = " eg. 'went for a bike ride' or 'slept'";
      pronounStuff = 
        <Typography variant="body1">
          tip: if you want to write something like 'went to HER appartment', you could enter
          'went to THEIR appartment' instead to make the final sentence make more sense. 
          (they / them / their / theirs / themself)
        </Typography>;
    } else if (this.state.currentQuestion == "where") {
      responseText = this.state.response.where
      question = "WHERE";
      explanation = "enter where, when or how the thing happened "
      example = " eg. 'on their birthday' or 'with Batman'";
      pronounStuff = 
        <Typography variant="body1">
          tip: if you want to write something like 'with HIS uncle', you could enter
          'with THEIR uncle' instead to make the final sentence make more sense. 
          (they / them / their / theirs / themself)
        </Typography>;
    } else if (this.state.currentQuestion == "why") {
      responseText = this.state.response.why
      question = "WHY"
      explanation = "enter an explanation or other clause";
      example = " eg. 'because they wanted to.' or 'in order to protect baby yoda.'";
      pronounStuff =
        <Typography variant="body1">
          tip: if you want to write something like 'because SHE WAS sad', you could enter
          'because THEY WERE sad' instead to make the final sentence make more sense. 
          (they / them / their / theirs / themself)
        </Typography>
    }
    return(
      <div className="prompt-text">
        <Grid container direction="column" spacing={5} justify="center" alignItems="center">

          <Grid item>
            <Grid container direction="column" spacing={1} justify="center" alignItems="center">
              <Grid item>
                <Typography variant="h3" align="center">{question}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" align="center">{explanation}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="body1" align="center">{example}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <TextField 
              id="standard-basic" 
              label={question} 
              multiline
              onChange={(event) => this.handleResponseChange(event)}
              value={responseText}
            />
          </Grid>

          <Grid item>
            <Button 
              onClick={() => this.handleNext()}
              variant="contained" 
              color="primary" 
              endIcon={<NavigateNextIcon/>}>
                Next
            </Button>
          </Grid>

        </Grid>
      </div>
    );
  }
}

class PlayerWaitingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoaded: false,
      players: [],
      codeWasValid: false,
      intervalID: null
    }
  }

  componentDidMount() {
    if (!this.props.gameJoined) {
      this.joinGame();
    } else {
      this.getData();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.intervalID);
  }

  joinGame() {
    let body = JSON.stringify(
      {
        type: "enter-waiting-room",
        name: this.props.name,
        code: this.props.gameCode
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from PlayerWaitingRoom/joinGame');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.codeWasValid) {
            this.props.joinGame(result.playerId);
            this.setState({
              isLoaded: true,
              players: result.gameState.players,
              codeWasValid: true,
            });
            this.getPlayerData()
          } else {
            this.props.noGameFound();
          }
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          });
        }
      );
  }

  goToResponses() {
    clearTimeout(this.state.intervalID);
    this.props.goToResponses()
  }

  getPlayerData() {
    let body = JSON.stringify(
      {
        type: "get-game-state",
        code: this.props.gameCode
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from PlayerWaitingRoom/getPlayerData');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.codeWasValid) {
            let intervalID = setTimeout(this.getPlayerData.bind(this), 4000);
            this.setState({
              players: result.gameState.players,
              intervalID: intervalID
            });
            if (result.gameState.gameStage == "in-progress") {
              this.goToResponses();
            } 
            
          } else {
            this.setState({
              codeWasValid: false
            });
          }
        },
        (error) => {
          this.setState({
            error: error
          });
        }
      );
  }

  createPlayers() {
    let players = Array();
    for (let player of this.state.players) {
      if (player.id == "1") {
        players.push(
          <Grid item>
            <Badge badgeContent="Host" color="secondary">
              <Chip label={player.name} color="primary"/>
            </Badge>
          </Grid>
        );
      } else {
        players.push(
          <Grid item>
            <Chip label={player.name} color="primary"/>
          </Grid>
        );
      }
    }
    return(players);
  }

  render() {
    if (this.state.error) {
      return (<div>Error: {this.state.error.message}</div>);
    } else if (!this.state.isLoaded) {
      return(<div>Loading...</div>);
    } else {
      if (this.state.codeWasValid) {
        return(
          <div className="prompt-text">
            <Grid container direction="column" spacing={5} justify="center" alignItems="center">

              <Grid item>
                <Typography variant="h4" align="center" >
                  You're in the waiting room! 
                </Typography>
              </Grid>

              <Grid item>
                <Grid container direction="column" spacing={2} justify="center" alignItems="center">
                  <Grid item>
                    <Typography variant="subtitle1" align="center" >players:</Typography>
                  </Grid>
                  <Grid item>
                    <Grid container direction="row" spacing={2} justify="center" alignItems="center">
                      {this.createPlayers()}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                <Typography variant="h5" align="center" >
                  {"game: " + this.props.gameCode}
                </Typography>
              </Grid>

            </Grid>
          </div>
        );
      } else {
        return(
          <div className="prompt-text">
            <Grid container direction="column" spacing={4} justify="center" alignItems="center">
              <Grid item>
                <Typography variant="h5" align="center" >
                  That game no longer exists (the host could have lost connection)
                </Typography>
              </Grid>
              <Grid item>
              <Button 
                onClick={() => this.props.enterNewCode()}
                variant="contained" 
                color="primary" >
                Enter Another Code
              </Button>

              </Grid>
              
            </Grid>
          </div>
        );
      }
    }
  }
}

class HostWaitingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoaded: false,
      players: Array(),
      code: "",
      callCounter: 0,
      codeExpired: false,
      intervalID: null
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.intervalID);
  }

  componentDidMount() {
    if (!this.props.gameCreated) {
      this.createWaitingRoom();
    } else {
      this.getData()
    }
  }

  createWaitingRoom() {
    let body = JSON.stringify(
      {
        type: "create-waiting-room",
        name: this.props.name
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from HostWaitingRoom/createWaitingRoom');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          this.props.createGame(result.gameState, result.playerId);
          let intervalID = setTimeout(this.getData.bind(this), 4000);
          this.setState({
            isLoaded: true,
            code: result.gameState.code,
            players: result.gameState.players,
            intervalID: intervalID
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          });
        }
      );
  }

  getData() {
    let body = JSON.stringify(
      {
        type: "get-game-state",
        code: this.state.code
      }
    )
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from HostWaitingRoom/getData');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            players: result.gameState.players,
            callCounter: this.state.callCounter + 1
          });
          if (this.state.callCounter < 600) {
            let intervalID = setTimeout(this.getData.bind(this), 4000);
            this.setState({intervalID: intervalID});
          } else {
            this.setState({
              codeExpired: true
            })
            this.props.endGame();
          }
        },
        (error) => {
          this.setState({
            error: error
          });
        }
      );
  }

  newCode() {
    this.setState({
      codeExpired: false,
      callCounter: 0,
      isLoaded: false,
    });
    this.createWaitingRoom()
  }

  createPlayers() {
    let players = Array();
    for (let player of this.state.players) {
      if (player.id == "1") {
        players.push(
          <Grid item>
            <Badge badgeContent="Host" color="secondary">
              <Chip label={player.name} color="primary"/>
            </Badge>
          </Grid>
        );
        
      } else {
        players.push(
          <Grid item>
            <Chip label={player.name} color="primary"/>
          </Grid>
        )
      }
    }
    return(players)
  }

  startGame() {
    clearTimeout(this.state.intervalID);
    this.props.startGame();
  }

  render() {
    if (this.state.error) {
      return (<div>Error: {this.state.error.message}</div>);
    } else if (!this.state.isLoaded) {
      return(<div>Loading...</div>);
    } else {
      if (!this.state.codeExpired) {
        let button;
        if (this.state.players.length > 1) {
          button = 
            <Button 
              onClick={() => this.startGame()}
              variant="contained" 
              color="primary" >
              Start Game
            </Button>
        } else {
          button = 
            <Button 
              disabled
              onClick={() => this.startGame()}
              variant="contained" 
              color="primary" >
              Start Game
            </Button>
        }
        return(
          <div className="prompt-text">
            <Grid container direction="column" spacing={4} justify="center" alignItems="center">

              <Grid item>
                <Grid container direction="column" spacing={1} justify="center" alignItems="center">
                  <Grid item>
                    <Typography variant="h5" align="center" >Your Game Code is:</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h3" align="center" >{this.state.code}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                <Grid container direction="column" spacing={2} justify="center" alignItems="center">
                  <Grid item>
                    <Typography variant="subtitle1" align="center" >players:</Typography>
                  </Grid>
                  <Grid item>
                    <Grid container direction="row" spacing={2} justify="center" alignItems="center">
                      {this.createPlayers()}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                {button}
              </Grid>
                
            </Grid>
          </div>
        );
      } else {
        return(
          <div className="prompt-text">
            <Grid container direction="column" spacing={5} justify="center" alignItems="center">
              <Grid item>
                <Typography variant="h5" align="center" >Your game code has expired</Typography>
              </Grid>
              <Grid item>
              <Button 
                  onClick={() => this.newCode()}
                  variant="contained" 
                  color="primary" 
                  >
                    Get New Code
                </Button>
              </Grid>
            </Grid>
          </div>
        );
      }
    }
  }
}

class EnterCode extends React.Component {

  constructor(props) {
    super(props);
    let message;
    if (props.invalid) {
      message = "Sorry " + props.playerName + ", the code you entered is invalid.";
    } else {
      message = "How's it goin " + props.playerName + ", Enter your game's 4 letter code";
    }
    this.state = {
      code: '',
      message: message
    };
    props.handleCodeChange('');
  }

  handleCodeChange(event) {
    let code = String(event.target.value);
    code = code.toUpperCase();
    if (code.length > 4) {
      code = code.slice(0, 4);
    }
    this.setState({code: code});
    this.props.handleCodeChange(code);
  }

  render() {

    let input;
    if (!this.props.invalid) {
      input = <TextField 
        id="standard-basic" 
        label="code" 
        onChange={(e) => this.handleCodeChange(e)}
        value={this.state.code}
      />
    } else {
      input = <TextField 
        error
        id="standard-basic" 
        label="invalid code" 
        onChange={(e) => this.handleCodeChange(e)}
        value={this.state.code}
      />
    }

    return(
      <div className="enter-game-code">
        <Grid container direction="column" spacing={5} justify="center" alignItems="center">
          <Grid item>
            <div className="prompt-text">
              <Typography variant="h5" align="center" >{this.state.message}</Typography>
            </div>
          </Grid>
          <Grid item>
             {input}
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={7} justify="center" alignItems="center">
              <Grid item>
                <Button 
                  onClick={this.props.handleBack}
                  variant="contained" 
                  color="primary" 
                  startIcon={<NavigateBeforeIcon/>}>
                    Back 
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  onClick={this.props.handleNext}
                  variant="contained" 
                  color="primary" 
                  endIcon={<NavigateNextIcon/>}>
                    Next
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
  
}

class EnterName extends React.Component {

  constructor(props) {
    super(props);
    this.state = {name: ""};
    props.handleNameChange("")
  }

  handleNameChange(event) {
    this.setState({name: event.target.value});
    this.props.handleNameChange(event.target.value)
  }

  render() {
    let input;
    if (!this.props.invalid) {
      input = <TextField 
        id="standard-basic" 
        label="Enter Your Name" 
        onChange={(event) => this.handleNameChange(event)}
        value={this.state.name}
      />;
    } else {
      input = <TextField 
        error
        id="standard-basic" 
        label="name is required" 
        onChange={(event) => this.handleNameChange(event)}
        value={this.state.name}
      />
    }
    return(
      <div className="enter-host-name">
        <Grid container direction="column" spacing={5} justify="center" alignItems="center">
          <Grid item>
            <div className="prompt-text">
              <Typography variant="h5" align="center" >{this.props.message}</Typography>
            </div>
          </Grid>
          <Grid item>
              {input}
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={7} justify="center" alignItems="center">
              <Grid item>
                <Button 
                  onClick={this.props.handleBack}
                  variant="contained" 
                  color="primary" 
                  startIcon={<NavigateBeforeIcon/>}>
                    Back 
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  onClick={this.props.handleNext}
                  variant="contained" 
                  color="primary" 
                  endIcon={<NavigateNextIcon/>}>
                    Next
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
  
}

class Game extends React.Component { 
  constructor(props) {
    super(props)
    this.state = {
      gameState: "start-options",
      playerName: "",
      gameCode: "",
      playerIsHost: false,
      gameCreated: false,
      gameJoined: false,
      playerID: 0,
      newComponentIsVisible: false
    }
  }

  onUnload = e => {
    if (this.state.playerIsHost && this.state.gameCreated) {
      this.endGame();
    } else if (!this.state.playerIsHost && this.state.gameJoined) {
      this.leaveGame();
    }
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onUnload);
  }

  handleNewGame() {
    this.setState({
      gameState: "enter-host-name",
      playerIsHost: true
    });
  }

  handleJoinGame() {
    this.setState({
      gameState: "enter-player-name",
      playerIsHost: false
    });
  }

  handleEnterNameBack() {
    this.setState({gameState: "start-options"});
  }

  handleHostNameNext() {
    if (this.state.playerName != "") {
      this.setState({gameState: "host-waiting-room"})
    } else {
      this.setState({gameState: "invalid-host-name"})
    }
  }

  handlePlayerNameNext() {
    if (this.state.playerName != "") {
      this.setState({gameState: "enter-game-code"})
    } else {
      this.setState({gameState: "invalid-player-name"});
    }
  }

  handleEnterCodeBack() {
    this.setState({gameState: "enter-player-name"})
  }

  handleEnterCodeNext() {
    if (this.state.gameCode.length == 4) {
      this.setState({gameState: "player-waiting-room"})
    } else {
      this.setState({gameState: "invalid-code"})
    }
  }

  handleNameChange(name) {
    this.setState({playerName: name});
  }

  handleCodeChange(code) {
    this.setState({gameCode: code});
  }

  joinGame(playerID) {
    this.setState({
      playerID: playerID,
      gameJoined: true
    });
    console.log(this.state.playerID);
  }

  enterNewCode() {
    this.setState({
      playerID: 0,
      gameJoined: false,
      gameCode: "",
      gameState: "enter-game-code"
    });
  }

  createGame(gameState, playerID) {
    this.setState({
      gameCode: gameState.code,
      playerID: playerID,
      gameCreated: true
    })
  }

  beginResponses() {
    this.setState({gameState: "enter-responses"});
  }

  startGame() {
    this.setState({
      gameState: 'enter-responses'
    });
    let body = JSON.stringify(
      {
        type: "start-game",
        code: this.state.gameCode
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from Game/startGame');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {},
        (error) => {}
      );
  }

  sendResponse(response) {
    let body = JSON.stringify(
      {
        type: "post-response",
        playerId: this.state.playerID,
        response: response,
        code: this.state.gameCode,
        name: this.state.playerName
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from Game/sendResponse');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {},
        (error) => {}
      );
    this.setState({gameState: "finished-responses"});
  }

  getSentences() {
    if (this.state.playerIsHost) {
      let body = JSON.stringify(
        {
          type: "create-sentences",
          code: this.state.gameCode,
        }
      );
      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      };
      console.log('request sent from Game/getSentences');
      fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
        .then(res => res.json())
        .then(
          (result) => {},
          (error) => {}
        );
    }
    this.setState({gameState: "view-sentences"});
  }

  endGame() {
    let body = JSON.stringify(
      {
        type: "end-game",
        code: this.state.gameCode
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from Game/endGame');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            gameCreated: false,
            gameCode: "",
        });}
        ,
        (error) => {}
      );
    
  }

  leaveGame() {
    let body = JSON.stringify(
      {
        type: "leave-game",
        code: this.state.gameCode,
        playerId: this.state.playerID
      }
    );
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    };
    console.log('request sent from Game/endGame');
    fetch('https://us-central1-to-do-list-266601.cloudfunctions.net/wwww', request)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            gameJoined: false,
            gameCode: "",
          });
        },
        (error) => {}
      );
    
  }

  render() {
    if (this.state.gameState == "start-options") {
      return(
          <StartOptions 
            handleNewGame={() => this.handleNewGame()} 
            handleJoinGame={() => this.handleJoinGame()}
          />
        );
    } else if (this.state.gameState == "enter-host-name") {
      return(
        <EnterName 
          message="You're the game host!" 
          invalid={false}
          handleBack={() => this.handleEnterNameBack()}
          handleNext={() => this.handleHostNameNext()}
          handleNameChange={(name) => this.handleNameChange(name)}
        />);

    } else if (this.state.gameState == "enter-player-name") {
      return(
        <EnterName 
          message="Enter whatever you want really" 
          invalid={false}
          handleBack={() => this.handleEnterNameBack()}
          handleNext={() => this.handlePlayerNameNext()}
          handleNameChange={(name) => this.handleNameChange(name)}
        />);
    } else if (this.state.gameState == "enter-game-code") {
      return(
        <EnterCode 
          playerName={this.state.playerName}
          invalid={false}
          handleBack={() => this.handleEnterCodeBack()}
          handleNext={() => this.handleEnterCodeNext()}
          handleCodeChange={(code) => this.handleCodeChange(code)}
        />);
    } else if (this.state.gameState == "invalid-player-name") {
      return(
        <EnterName
          message="You can type literally anything except for that."
          invalid={true}
          handleBack={() => this.handleEnterNameBack()}
          handleNext={() => this.handlePlayerNameNext()}
          handleNameChange={(name) => this.handleNameChange(name)}
        />);
    } else if (this.state.gameState == "invalid-code") {
      return(
        <EnterCode 
            playerName={this.state.playerName}
            invalid={true}
            handleBack={() => this.handleEnterCodeBack()}
            handleNext={() => this.handleEnterCodeNext()}
            handleCodeChange={(code) => this.handleCodeChange(code)}
        />);
    } else if (this.state.gameState == "invalid-host-name") {
      return(
        <EnterName 
          message="You have to have a name" 
          invalid={true}
          handleBack={() => this.handleEnterNameBack()}
          handleNext={() => this.handleHostNameNext()}
          handleNameChange={(name) => this.handleNameChange(name)}
        />);
    } else if (this.state.gameState == "host-waiting-room") {
      return(
        <HostWaitingRoom
          gameCreated={this.state.gameCreated}
          name={this.state.playerName}
          createGame={(gameState, playerID) => this.createGame(gameState, playerID)}
          endGame={() => this.endGame()}
          newCode={() => this.handleHostNameNext()}
          startGame={() => this.startGame()}
        />
      );
    } else if (this.state.gameState == "player-waiting-room") {
      return(
        <PlayerWaitingRoom
          gameCode={this.state.gameCode}
          name={this.state.playerName}
          gameJoined={this.state.gameJoined}
          joinGame={(playerID) => this.joinGame(playerID)}
          noGameFound={() => this.setState({gameState: "invalid-code"})}
          goToResponses={() => this.beginResponses()}
          enterNewCode={() => this.enterNewCode()} />
      );
    } else if (this.state.gameState == "enter-responses") {
      return(
        <EnterResponses
          name={this.state.playerName}
          sendResponse={(response) => this.sendResponse(response)}/>
      );
    }  else if (this.state.gameState == "finished-responses")  {
      return(
        <FinishedResponses
          gameCode={this.state.gameCode}
          getSentences={() => this.getSentences()}
          enterNewCode={() => this.enterNewCode()}/>
      )
    } else if (this.state.gameState == "view-sentences") {
      return(
        <ViewSentences gameCode={this.state.gameCode}/>
      )
    }
  }

}

function App() {
  return (
    <div className="whole-window">
      <Game/>
    </div>
  );
}

export default App;
