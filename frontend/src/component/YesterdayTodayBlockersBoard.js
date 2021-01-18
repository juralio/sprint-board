import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Card,
  ThemeProvider,
  createMuiTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { getCurrentSprint } from "../service/issue-service.js";
import { RotateLoader } from "react-spinners";
import classNames from "classnames";
import { wasCompletedOnLastWorkingDay } from "../helper/issue-helper.js";
import { now } from "moment";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    fontFamily: "Raleway, Arial",
  },
  header: {
    display: "flex",
    width: "100%",
    padding: "16px",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    display: "flex",
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    height: "100px",
    padding: "16px",
    margin: "16px",
  },
  issueCard: {
    display: "flex",
    flex: 1,
    height: "50px",
    padding: "16px",
    margin: "16px",
  },
  subtasksGrid: {
    margin: "16px",
  },
  button: {
    margin: "16px",
  },
  text: {
    margin: "16px",
  },
});

const theme = createMuiTheme({
  typography: {
    fontFamily: "Montserrat",
  },
});

const issueStati = ["Open", "In Progress", "Done", "Resolved"];
const completedIssueStatiStartIndex = 2;
const taskStati = ["Open", "In Progress", "Code Review", "Done"];

const issueStatiClasses = {
  [issueStati[0]]: "open",
  [issueStati[1]]: "in-progress",
  [issueStati[2]]: "done",
  [issueStati[3]]: "done",
};

const scrollToCompletedOrInProgressItems = () => {
  setTimeout(() => {
    const completeItem = document.querySelector(".latest-complete");
    completeItem && completeItem.scrollIntoView(true);

    if (!completeItem) {
      const inProgressItem = document.querySelector(".in-progress");
      inProgressItem && inProgressItem.scrollIntoView(true);
    }
  });
};

const YesterdayTodayBlockersBoard = () => {
  const classes = useStyles();
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dayOfTheWeek, setDayOfTheWeek] = useState("yesterday");

  const [assignees, setAssignees] = useState([]);
  const [assigneesIndex, setAssigneesIndex] = useState(0);

  const previousAssignee = () => {
    let n = assigneesIndex > 0 ? assigneesIndex - 1 : assignees.length - 1;
    console.log(n);
    setAssigneesIndex(n);
  };

  const nextAssignee = () => {
    let n = assigneesIndex < assignees.length - 1 ? assigneesIndex + 1 : 0;
    console.log(n);
    setAssigneesIndex(n);
  };

  const unique = (arr) => {
    var u = {},
      a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
      if (!u.hasOwnProperty(arr[i])) {
        a.push(arr[i]);
        u[arr[i]] = 1;
      }
    }
    return a;
  };

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  useEffect(() => {
    let ppl = issues
      .filter(
        (issue) => issue.fields.assignee && issue.fields.assignee.displayName
      )
      .map((issue) => issue.fields.assignee.displayName);
    let uniquePpl = shuffleArray(unique(ppl));
    console.log("ppl", shuffleArray(unique(ppl)));
    setAssignees(uniquePpl);
  }, [issues]);

  const renderSubTasksForStatus = (subtasks, status) => (
    <div key={status} className="sub-task-column">
      {subtasks
        .filter(
          (subtask) =>
            subtask.fields.status.name.toLowerCase() === status.toLowerCase()
        )
        .map((subtask) => (
          <div key={subtask.key} className="sub-task-container">
            {subtask.fields.summary}
          </div>
        ))}
    </div>
  );

  const isIssueDone = (issue) => issue.fields.status.name === "Done";

  const renderIssueContent = (issue) => {
    const isNewlyCompleted = wasCompletedOnLastWorkingDay(issue);
    return (
      <div>
        <Card
          className={classNames(
            classes.issueCard,
            "issue",
            issueStatiClasses[issue.fields.status.name],
            {
              "latest-complete": isNewlyCompleted,
            }
          )}
        >
          <span className="story-points">{issue.fields.customfield_10008}</span>
          <h4>
            {issue.key} - {issue.fields.summary} - {issue.fields.status.name}
          </h4>
          {isNewlyCompleted && (
            <span
              className="latest-complete-indicator"
              role="img"
              aria-label="Rocket emoji"
            >
              🚀
            </span>
          )}
        </Card>
        {!isIssueDone(issue) && (
          <div
            className={classNames(classes.subtasksGrid, "sub-task-grid")}
            style={{
              gridTemplateColumns: `repeat(${taskStati.length}, minmax(0, 1fr))`,
            }}
          >
            {taskStati.map((status) =>
              renderSubTasksForStatus(issue.fields.subtasks, status)
            )}
          </div>
        )}
      </div>
    );
  };

  const sortCompletedIssuesFirst = (a, b) => {
    const aStatusIndex = issueStati.indexOf(a.fields.status.name);
    const bStatusIndex = issueStati.indexOf(b.fields.status.name);

    if (
      aStatusIndex >= completedIssueStatiStartIndex &&
      bStatusIndex < completedIssueStatiStartIndex
    ) {
      return -1;
    } else if (
      bStatusIndex >= completedIssueStatiStartIndex &&
      aStatusIndex < completedIssueStatiStartIndex
    ) {
      return 1;
    }
    return 0;
  };

  const sortByResolutionDateAscending = (a, b) => {
    const aDateUnParsed = a.fields.resolutiondate;
    const bDateUnParsed = b.fields.resolutiondate;

    if (!aDateUnParsed || !bDateUnParsed) {
      return 0;
    }

    var dateA = new Date(a.fields.resolutiondate),
      dateB = new Date(b.fields.resolutiondate);
    return dateA - dateB;
  };

  const sortByAssignee = (a, b) => {
    const aAssignee = a.fields.assignee;
    const bAssignee = b.fields.assignee;
    if (!aAssignee || !bAssignee) {
      return null;
    }
    return aAssignee.displayName.localeCompare(bAssignee.displayName);
  };

  const MONDAY = 1;

  const isWithinADayAgo = (timestamp) => {
    let aDate = Date.parse(timestamp);
    let aDayAgo = new Date();
    console.log("now", aDayAgo);
    if (aDayAgo.getDay() === MONDAY) {
      if (dayOfTheWeek !== "before the weekend")
        setDayOfTheWeek("before the weekend");
      aDayAgo.setDate(aDayAgo.getDate() - 3);
    } else {
      aDayAgo.setDate(aDayAgo.getDate() - 1);
    }
    return aDate > aDayAgo;
  };

  const renderDoneIssues = () => {
    return issues
      .filter(
        (issue) =>
          issue.fields.issuetype.name !== "Sub-task" &&
          issue.fields.assignee &&
          issue.fields.assignee.displayName == assignees[assigneesIndex] &&
          isWithinADayAgo(issue.fields.updated) &&
          issue.fields.status.name === "Done"
      )
      .sort(sortCompletedIssuesFirst)
      .sort(sortByAssignee)
      .map((issue) => {
        console.log(issue);
        return <li key={issue.id}>{renderIssueContent(issue)}</li>;
      });
  };

  const renderInProgressIssues = () => {
    console.log(issues);
    return issues
      .filter(
        (issue) =>
          issue.fields.issuetype.name !== "Sub-task" &&
          issue.fields.assignee &&
          issue.fields.assignee.displayName == assignees[assigneesIndex] &&
          issue.fields.status.name === "In Progress"
      )
      .sort(sortCompletedIssuesFirst)
      .sort(sortByAssignee)
      .map((issue) => {
        console.log(issue);
        return <li key={issue.id}>{renderIssueContent(issue)}</li>;
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const activeSprint = await getCurrentSprint();
      setIssues(activeSprint.issues);
      setIsLoading(false);
      scrollToCompletedOrInProgressItems();
    };
    fetchData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <div className={classes.header}>
          <Button
            className={classes.button}
            variant="contained"
            onClick={() => previousAssignee()}
          >
            Previous
          </Button>
          <Typography variant="h4" className={classes.text}>
            {assignees[assigneesIndex]}
          </Typography>
          <Typography variant="h5" className={classes.text}>
            {assigneesIndex + 1}/{assignees.length}
          </Typography>
          <Button
            className={classes.button}
            variant="contained"
            onClick={() => nextAssignee()}
          >
            Next
          </Button>
        </div>
        <div className={classes.content}>
          <div className={classes.cardContainer}>
            <Card
              raised
              className={classes.card}
              style={{
                background: `#63a6a9`,
              }}
            >
              <Typography variant="h4" className={classes.text}>
                What did you do {dayOfTheWeek}?
              </Typography>
            </Card>
            <ul className="issue-list">{renderDoneIssues()}</ul>
          </div>
          <div className={classes.cardContainer}>
            <Card
              raised
              className={classes.card}
              style={{
                background: `#d09b2c`,
              }}
            >
              <Typography variant="h4" className={classes.text}>
                What will you do today?
              </Typography>
            </Card>
            <ul className="issue-list">{renderInProgressIssues()}</ul>
          </div>
          <div className={classes.cardContainer}>
            <Card
              raised
              className={classes.card}
              style={{
                background: `#989390`,
              }}
            >
              <Typography variant="h4" className={classes.text}>
                Is there any impediment?
              </Typography>
            </Card>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default YesterdayTodayBlockersBoard;
