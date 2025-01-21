npm run build
rsync -av --progress --delete ./dist/ dockerone:~/webapps/lark-printer/printer

