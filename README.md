# 🛠️ GitHub Contribution & Branching Guide

This document outlines the standard workflow for contributing code, creating Pull Requests (PRs), and promoting features across our multi-stage branching model (`build` → `pre-production` → `production`).

---

## 📌 Branching Model Overview

```text
[ Developer Machine ] ──(git push)──>  build  (Level 1: Active Workspace)
                                         │
                             (PR + 1 Approval)
                                         ▼
                                   pre-production (Level 2: Staging / Testing)
                                         │
                             (PR + Admin Only Approval)
                                         ▼
                                     production  (Level 3: Live Release)
```
build (Default Branch): Open workspace. All ongoing development and feature additions are pushed here.

pre-production: Staging environment. Tested features are merged here via Pull Requests for integration verification.

production: Protected live environment. Restricted branch; only the designated Repository Admin can merge changes here.

⚙️ Prerequisites (One-Time Setup)
Perform these steps if you are setting up your workspace for the first time:

Open terminal in your project directory:


```cd /path/to/your/project```
Initialize local Git repository:


```git init```
Enable credential caching (avoids re-entering password/PAT on every push):


```git config --global credential.helper store```
🟢 Level 1: Uploading Work (Local Machine → build)
Follow these steps to save progress from your local computer to GitHub:

Switch to the build branch:


```git checkout build```
Pull the latest remote updates:


```git pull origin build```
Stage all created or modified files:


```git add .```
Commit local changes:


```git commit -m "<your_commit_message_here>"```
Push updates to GitHub:


```git push origin build```
🟡 Level 2: Staging for Review (build → pre-production)
Follow these steps when feature updates on build are complete and ready for testing:

Open your browser and navigate to the project repository on GitHub.

Click on the Pull requests tab, then click the New pull request button.

Configure the branch targets:

```base: pre-production```

```compare: build```

Click Create pull request, provide a summary of changes, and assign a reviewer.

Once 1 reviewer approval is received, click Merge pull request.

🔴 Level 3: Production Deployment (pre-production → production)
Follow these steps when staged code in pre-production passes all checks and is ready to go live:

Navigate to the project repository on GitHub.

Click Pull requests → New pull request.

Configure the branch targets:

```base: production```

```compare: pre-production```

Click Create pull request and submit.

Notify the Repository Admin. Only the designated admin has authorization to review, approve, and click Merge pull request.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

Designed & Developed by Akash Mishra

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
