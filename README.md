# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

### Login Page

User authentication.

!["screen capture of login menu"](https://github.com/SebDufresne/tinyapp/blob/master/docs/login.png)

### Create short URL

Allows the creation of new short URLs.

!["screen capture of Create New URL"](https://github.com/SebDufresne/tinyapp/blob/master/docs/urls-new.png)

### Summary page for each URL

Give detailed information about short URL usage, and allows edits to the path given to the shorten version.

!["screen capture of usage summary for a URL and Edit Page"](https://github.com/SebDufresne/tinyapp/blob/master/docs/urls-show-usage.png)

### Summary of all short URLs

List all the short URLs for a given user.

!["screen capture of Summary of all short URLs"](https://github.com/SebDufresne/tinyapp/blob/master/docs/urls-index-summary.png)

### Details for one URL

A list of every visit for a given short URL, sorted by dates, from most recent to oldest.

!["screen capture of details for one URL"](https://github.com/SebDufresne/tinyapp/blob/master/docs/urls-index-usage-details.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- cookie-parser
- method-override
- moment-timezone
- uuid

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Current Limitations/Bugs/Future Features

- BUG: The selected menu item doesn't highlight properly
- BUG: There's a "blind spot" behind the footer, where items can be unaccessible
- TO-DO: Re-style the tables with a grid approach.
- TO-DO: Review the breakpoints for a mobile first approach.
- TO-DO: Add the number of users/total visits on URL index page.
