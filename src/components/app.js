import React, { Component } from "react";
import moment from "moment";
import welcomeImage from "../images/welcome.svg";
import spinner from "../images/spinner.svg";
import { GOOGLE_API_KEY, CALENDAR_ID_BIG, CALENDAR_ID_SMALL } from "../config.js";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: moment().format("dd, Do MMMM, h:mm A"),
      events: [],
      isBusy: false,
      isEmpty: false,
      isLoading: true,
      timeSmall: moment().format("dd, Do MMMM, h:mm A"),
      eventsSmall: [],
      isBusySmall: false,
      isEmptySmall: false,
      isLoadingSmall: true
    };
  }

  componentDidMount = () => {
    this.getEvents();
    setInterval(() => {
      this.tick();
    }, 1000);
    setInterval(() => {
      this.getEvents();
    }, 60000);
    
    this.getEventsSmall();
    setInterval(() => {
      this.tickSmall();
    }, 1000);
    setInterval(() => {
      this.getEventsSmall();
    }, 60000);
  };

  getEvents() {
    let that = this;
    function start() {
      gapi.client
        .init({
          apiKey: GOOGLE_API_KEY
        })
        .then(function() {
          return gapi.client.request({
            path: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID_BIG}/events?maxResults=3&orderBy=updated&timeMin=${moment().toISOString()}&timeMax=${moment()
              .endOf("day")
              .toISOString()}`
          });
        })
        .then(
          response => {
            let events = response.result.items;
            let sortedEvents = events.sort(function(a, b) {
              return (
                moment(b.start.dateTime).format("YYYYMMDD") -
                moment(a.start.dateTime).format("YYYYMMDD")
              );
            });
            if (events.length > 0) {
              that.setState(
                {
                  events: sortedEvents,
                  isLoading: false,
                  isEmpty: false
                },
                () => {
                  that.setStatus();
                }
              );
            } else {
              that.setState({
                isBusy: false,
                isEmpty: true,
                isLoading: false
              });
            }
          },
          function(reason) {
            that.setState({
              isBusy: false,
              isEmpty: true,
              isLoading: false
            });
            console.log(reason);
          }
        );
    }
    gapi.load("client", start);
  }
  getEventsSmall() {
    let that = this;
    function start() {
      gapi.client
        .init({
          apiKey: GOOGLE_API_KEY
        })
        .then(function() {
          return gapi.client.request({
            path: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID_SMALL}/events?maxResults=3&orderBy=updated&timeMin=${moment().toISOString()}&timeMax=${moment()
              .endOf("day")
              .toISOString()}`
          });
        })
        .then(
          response => {
            let eventsSmall = response.result.items;
            let sortedEventsSmall = eventsSmall.sort(function(a, b) {
              return (
                moment(b.start.dateTime).format("YYYYMMDD") -
                moment(a.start.dateTime).format("YYYYMMDD")
              );
            });
            if (eventsSmall.length > 0) {
              that.setState(
                {
                  eventsSmall: sortedEventsSmall,
                  isLoadingSmall: false,
                  isEmptySmall: false
                },
                () => {
                  that.setStatusSmall();
                }
              );
            } else {
              that.setState({
                isBusySmall: false,
                isEmptySmall: true,
                isLoadingSmall: false
              });
            }
          },
          function(reason) {
            that.setState({
              isBusySmall: false,
              isEmptySmall: true,
              isLoadingSmall: false
            });
            console.log(reason);
          }
        );
    }
    gapi.load("client", start);
  }

  tick = () => {
    let time = moment().format("dddd, Do MMMM, h:mm A");
    this.setState({
      time: time
    });
  };
  
  tickSmall = () => {
    let timeSmall = moment().format("dddd, Do MMMM, h:mm A");
    this.setState({
      timeSmall: timeSmall
    });
  };

  setStatus = () => {
    let now = moment();
    let events = this.state.events;
    for (var e = 0; e < events.length; e++) {
      var eventItem = events[e];
      if (
        moment(now).isBetween(
          moment(eventItem.start.dateTime),
          moment(eventItem.end.dateTime)
        )
      ) {
        this.setState({
          isBusy: true
        });
        return false;
      } else {
        this.setState({
          isBusy: false
        });
      }
    }
  };
  
  setStatusSmall = () => {
    let now = moment();
    let eventsSmall = this.state.eventsSmall;
    for (var e = 0; e < eventsSmall.length; e++) {
      var eventItemSmall = eventsSmall[e];
      if (
        moment(now).isBetween(
          moment(eventItemSmall.start.dateTime),
          moment(eventItemSmall.end.dateTime)
        )
      ) {
        this.setState({
          isBusySmall: true
        });
        return false;
      } else {
        this.setState({
          isBusySmall: false
        });
      }
    }
  };

  render() {
    const { time, events } = this.state;
    const { timeSmall, eventsSmall } = this.state;

    let eventsList = events.map(function(event) {
      return (
        <a
          className="list-group-item"
          href={event.htmlLink}
          target="_blank"
          key={event.id}
        >
          {event.summary}{" "}
          <span className="badge">
            {moment(event.start.dateTime).format("h:mm a")},{" "}
            {moment(event.end.dateTime).diff(
              moment(event.start.dateTime),
              "minutes"
            )}{" "}
            minutes, {moment(event.start.dateTime).format("MMMM Do")}{" "}
          </span>
        </a>
      );
    });
    
    let eventsListSmall = eventsSmall.map(function(event) {
      return (
        <a
          className="list-group-item"
          href={event.htmlLink}
          target="_blank"
          key={event.id}
        >
          {event.summary}{" "}
          <span className="badge">
            {moment(event.start.dateTime).format("h:mm a")},{" "}
            {moment(event.end.dateTime).diff(
              moment(event.start.dateTime),
              "minutes"
            )}{" "}
            minutes, {moment(event.start.dateTime).format("MMMM Do")}{" "}
          </span>
        </a>
      );
    });

    let emptyState = (
      <div className="empty">
        <img src={welcomeImage} alt="Welcome" />
        <h3>
          No meetings are scheduled for the day. Create one by clicking the
          button below.
        </h3>
      </div>
    );

    let loadingState = (
      <div className="loading">
        <img src={spinner} alt="Loading..." />
      </div>
    );

    return (
    <div className="container-full">
    <h1 className="current-heading">Meeting Rooms Booking Goa</h1>
      <div className="current-time">{time}, 2018</div>
      <div className="container">
      <div className="container-half">
        <div
            className={
              this.state.isBusy ? "current-status busy" : "current-status open"
            }
          >
            <h1>{this.state.isBusy ? "BUSY" : "OPEN"}</h1>
            <h2>(Big Room)</h2>
          </div>
          <div className="upcoming-meetings">
            <h2>Upcoming Meetings</h2>
            <div className="list-group">
              {this.state.isLoading && loadingState}
              {events.length > 0 && eventsList}
              {this.state.isEmpty && emptyState}
            </div>
            <a
              className="primary-cta left"
              href={"https://calendar.google.com/calendar?cid=" + CALENDAR_ID_BIG}
              target="_blank"
            >
              +
            </a>
          </div>
        </div>
        <div className="container-half">
          <div
            className={
              this.state.isBusySmall ? "current-status busy" : "current-status open"
            }
          >
            <h1>{this.state.isBusySmall ? "BUSY" : "OPEN"}</h1>
            <h2>(Small Room)</h2>
          </div>
          <div className="upcoming-meetings">
            <h2>Upcoming Meetings</h2>
            <div className="list-group">
              {this.state.isLoadingSmall && loadingState}
              {eventsSmall.length > 0 && eventsListSmall}
              {this.state.isEmptySmall && emptyState}
            </div>
            <a
              className="primary-cta"
              href={"https://calendar.google.com/calendar?cid=" + CALENDAR_ID_SMALL}
              target="_blank"
            >
              +
            </a>
          </div>
        </div>
      </div>
    </div>
    );
  }
}
