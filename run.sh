git pull
(cd ./frontend && npm install) & (cd ./backend && npm install)
(cd ./frontend && PORT=${1-3000} npm start) & (cd ./backend && npm start)
