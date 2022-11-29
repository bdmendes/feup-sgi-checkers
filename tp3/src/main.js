import { CGFapplication } from '../../lib/CGF.js';
import { XMLscene } from './engine/XMLscene.js';
import { MyInterface } from './engine/MyInterface.js';
import { MySceneGraph } from './engine/MySceneGraph.js';

/**
 * Parse url variables to get the right file
 * @return {*} 
 */
function getUrlVars() {
    const vars = {};
    const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}

/**
 * Main function of the application
 */
function main() {
    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();
    const myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
    // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
    const filename = getUrlVars()['file'] || "demo.xml";

    // create and load graph, and associate it to scene. 
    // Check console for loading errors
    const myGraph = new MySceneGraph(filename, myScene);

    myInterface.sceneGraph = myGraph;

    // start
    app.run();
}

main();
