import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getCurrentSprint } from "./service/issue-service.js";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import Board from "./component/Board";
import YesterdayTodayBlockersBoard from "./component/YesterdayTodayBlockersBoard";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const issueStati = ["Open", "In Progress", "Done", "Resolved"];
const completedIssueStatiStartIndex = 2;

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

const Container = () => {
  const [value, setValue] = useState(0);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="Alternative 'cosy' sprint board" {...a11yProps(0)} />
          <Tab label="Yesterday, today, impediments" {...a11yProps(1)} />
          <Tab label="✨ New! ✨" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Board
          isIssueDone={isIssueDone}
          renderSubTasksForStatus={renderSubTasksForStatus}
          issues={issues}
          sortCompletedIssuesFirst={sortCompletedIssuesFirst}
          sortByResolutionDateAscending={sortByResolutionDateAscending}
          setIsLoading={setIsLoading}
          setIssues={setIssues}
          isLoading={isLoading}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <YesterdayTodayBlockersBoard issues={issues} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        Free space for a new board...
      </TabPanel>
    </>
  );
};

export default Container;
