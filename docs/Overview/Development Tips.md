# Development Tips

Development of any new feature should be done in a branch created from ```develop```, and then merged into ```develop``` via a pull request.
There is a main branch however that is currently support HEAL and eventually will be used for releases.

Any code needed to access gen services should be done using RTK Query or Redux-toolkit Reducers.

Any related frontend code should be done in the @gen3/frontend package.
This includes any UI components, pages, or features.
