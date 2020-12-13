import * as THREE from "three";

function MatchPointsLoader() {
    const loader = new THREE.FileLoader();
    function loadPoints(url) {
        return new Promise((resolve,reject)=>{
            const onLoad = (jsonFile)=>{
                let matchPointsData = JSON.parse(jsonFile);
                console.log(matchPointsData);
                resolve(matchPointsData);
            };
            loader.load(url, onload,undefined,reject);
        })
    }

    this.loadPoints = loadPoints;
    // this.matchPointsData = matchPointsData;
}

export default MatchPointsLoader;
