export async function parseIncludes(sceneGraph, includesNode) {
    const children = includesNode.children;
    const nodeNames = [];

    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName != 'include')
            return "unknown tag <" + children[i].nodeName + ">";
        else
            nodeNames.push(children[i].nodeName);
    }

    for (let i = 0; i < children.length; i++) {
        if (nodeNames[i] != 'include')
            return "unknown tag <" + nodeNames[i] + ">";
        else {
            const error = await parseInclude(sceneGraph, children[i]);
            if (error != null)
                return error;
        }
    }
}

async function parseInclude(sceneGraph, includeNode) {
    const filename = sceneGraph.reader.getString(includeNode, 'file');
    if (filename == null)
        return "no file defined for include";

    console.log('Loading additional scene from ' + filename + '...');

    const response = await fetch('scenes/' + filename);
    if (!response.ok)
        return "unable to fetch file " + filename;

    const fileBlob = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileBlob, "text/xml");

    const error = await sceneGraph.parseXMLFile(xmlDoc.documentElement, false);
    if (error != null)
        return error;
}