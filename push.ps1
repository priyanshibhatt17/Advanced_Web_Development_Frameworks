$folders = @('portfolio-app', 'practical3-github-api', 'practical4-task-manager-api', 'practical5-task-manager-mongo', 'practical6-task-manager-frontend')
foreach ($f in $folders) {
  Write-Host "Processing $f"
  cd $f
  Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
  Set-Content .gitignore "node_modules/`nmongo-data/`n.env" -Encoding UTF8
  git init
  git checkout -b $f
  git add .
  git commit -m "Upload $f"
  git remote add origin https://github.com/priyanshibhatt17/Advanced_Web_Development_Frameworks.git
  git push -f -u origin $f
  Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
  cd ..
}
