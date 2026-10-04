import "./App.css";
import { Route, Switch } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";
import FeedPage from "./Pages/FeedPage";
import TrailsPage from "./Pages/TrailsPage";
import TrailProfilePage from "./Pages/TrailProfilePage";
import NewJournalPage from "./Pages/NewJournalPage";
import TeamUpFeedPage from "./Pages/TeamUpFeedPage";
import NewTeamUpPage from "./Pages/NewTeamUpPage";
import UserProfilePage from "./Pages/UserProfilePage";
import RequestsPage from "./Pages/RequestsPage";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" component={Homepage} exact />
        <Route path="/feed" component={FeedPage} />
        <Route path="/teamups/new" component={NewTeamUpPage} />
        <Route path="/teamups" component={TeamUpFeedPage} />
        <Route path="/users/:id" component={UserProfilePage} />
        <Route path="/requests" component={RequestsPage} />
        <Route path="/trails/:id" component={TrailProfilePage} />
        <Route path="/trails" component={TrailsPage} />
        <Route path="/journals/new" component={NewJournalPage} />
        <Route path="/chat/:userId" component={ChatPage} />
        <Route path="/chat" component={ChatPage} />
      </Switch>
    </div>
  );
}

export default App;
