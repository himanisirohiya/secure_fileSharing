module.exports = {
    // https://www.phpmyadmin.co/
    mysql: {
        host: '[YOUR HOST]', 
        user: '[YOUR USERNAME]',
        password: '[YOUR PASSWORD]',
        database:'[YOUR DATABASE]', // The user table previously built is in this database
        port: "[PORT NUMBER]"
    },
    auth_token: [
       "YOUR AUTH TOKEN",
    ].join('\n')
};