import {FilesystemContent} from "./filesystem";
import {ContentDatabase} from "./ContentDatabase";

const ContentRoot = "";



const setup = () => {
    console.log("setup");
    const config = { store: new FilesystemContent({ rootPath: ContentRoot})}
    return new ContentDatabase(config)
};

const ContentSource = setup();

export default ContentSource;
