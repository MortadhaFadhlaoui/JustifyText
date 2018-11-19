# Welcome

This node server is on API REST which justifies a text passed as parameter:
- developed with **NodeJS(expressjs)**.
- data stored in **MongoDB** database.
- **jsonwebtoken** for authentication, the endpoint: [api/token](https://contact-webmaster-server.herokuapp.com/api/token) return unique token via a POST request and json body like :  {"email": "foo@bar.com"}.
- the endpoint [api/justify](https://contact-webmaster-server.herokuapp.com/api/justify) return the justified text via a POST request and text/plain body contain the text.
- this server is deployed in **Heroku**.
# Try it !
