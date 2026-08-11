================================================================================
          HOW TO CONTRIBUTE CODE AND ELEVATE IT TO PRODUCTION
================================================================================

PREREQUISITES (ONE-TIME SETUP):
--------------------------------------------------------------------------------
1. Open terminal in your local project folder:
   cd /path/to/your/project

2. Initialize Git (if not already done):
   git init

3. Save your GitHub credentials locally so you don't type your password every time:
   git config --global credential.helper store


================================================================================
LEVEL 1: UPLOADING YOUR WORK (LOCAL MACHINE -> BUILD BRANCH)
================================================================================
Use this every time you want to save your progress from your computer to GitHub.

1. Switch to the main workspace branch:
   git checkout build

2. Download any updates made by teammates before you start working:
   git pull origin build

3. Stage all your new/edited files:
   git add .

4. Save your progress locally with a description of what you changed:
   git commit -m "your description of changes here"

5. Send your code up to GitHub:
   git push origin build


================================================================================
LEVEL 2: PROMOTING TO STAGING (BUILD -> PRE-PRODUCTION)
================================================================================
Use this when a feature on the build branch is finished and ready for testing.

1. Open your browser and go to your project's GitHub repository page.

2. Click on the "Pull requests" tab near the top, then click the green "New pull request" button.

3. Set the branch dropdowns:
   - base: pre-production
   - compare: build

4. Click "Create pull request", write a brief explanation of what is ready for testing, and submit it.

5. Ask a teammate to review it. Once 1 approval is granted, click "Merge pull request".


================================================================================
LEVEL 3: GOING LIVE (PRE-PRODUCTION -> PRODUCTION)
================================================================================
Use this when pre-production testing is complete and code is ready for release.

1. Go to your project's GitHub repository page in your browser.

2. Click "Pull requests" -> "New pull request".

3. Set the branch dropdowns:
   - base: production
   - compare: pre-production

4. Click "Create pull request" and submit it.

5. Notify the repository owner. Only the designated admin can review and click "Merge pull request" to deploy live.
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
