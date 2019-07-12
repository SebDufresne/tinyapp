# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screen capture of login menu"](https://github.com/SebDufresne/tinyapp/blob/master/docs/login.png)
!["screen capture of Create New URL"](https://github.com/SebDufresne/tinyapp/blob/master/docs/urls-new.png)
!["screen capture of usage summary for a URL and Edit Page"](https://github.com/SebDufresne/tinyapp/blob/master/docs/urls-show-usage.png)
!["screen capture of Summary of all short URLs"](https://github.com/SebDufresne/tinyapp/blob/master/docs/urls-index-summary.png)
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


## Current Limitations/Bugs

- The selected menu item doesn't highlight properly
- There's a "blind spot" behind the footer, where items can be unaccessible
- The tables could benefit from a grid styling approach
