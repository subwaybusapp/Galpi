import { subwayLineStations } from "../data/subwayLineStations";
type SubwayDirection = "상행" | "하행" | "내선" | "외선";

const directionByIncreasingIndex: Record<string, SubwayDirection> = {
    "2호선": "내선",
    "7호선": "상행",
    "8호선": "상행",
    "5호선": "상행",
    "4호선": "하행",
};

function getOppositeDirection(direction: SubwayDirection): SubwayDirection {
    if (direction === "상행") {
        return "하행";
    }

    if (direction === "하행") {
        return "상행";
    }

    if (direction === "내선") {
        return "외선";
    }

    return "내선";
}

type ReachParams = {
    lineName: string;
    boardingStationName: string;
    destinationStationName: string;
    trainLineName: string;
};

export function canTrainReachDestination({
    lineName,
    boardingStationName,
    destinationStationName,
    trainLineName,
}: ReachParams) {
    const stations = subwayLineStations[lineName];

    if (!stations) {
        return true;
    }

    const boardingIndex = stations.indexOf(removeStationSuffix(boardingStationName));
    const destinationIndex = stations.indexOf(removeStationSuffix(destinationStationName));
    const trainDestinationName = extractTrainDestination(trainLineName);
    const trainDestinationIndex = stations.indexOf(trainDestinationName);

    if (
        boardingIndex === -1 ||
        destinationIndex === -1 ||
        trainDestinationIndex === -1
    ) {
        return true;
    }

    if (boardingIndex < destinationIndex) {
        return destinationIndex <= trainDestinationIndex;
    }

    if (boardingIndex > destinationIndex) {
        return destinationIndex >= trainDestinationIndex;
    }

    return false;
}

export function getDirectionByStations(
    lineName: string,
    boardingStationName: string,
    destinationStationName: string
) {
    const stations = subwayLineStations[lineName];

    if (!stations) {
        return null;
    }

    const boardingIndex = stations.indexOf(removeStationSuffix(boardingStationName));
    const destinationIndex = stations.indexOf(removeStationSuffix(destinationStationName));

    if (boardingIndex === -1 || destinationIndex === -1) {
        return null;
    }

    if (boardingIndex === destinationIndex) {
        return null;
    }

    const increasingDirection = directionByIncreasingIndex[lineName];

    if (!increasingDirection) {
        return null;
    }

    const decreasingDirection =
        getOppositeDirection(increasingDirection);

    return destinationIndex > boardingIndex
        ? increasingDirection
        : decreasingDirection;
}

function extractTrainDestination(trainLineName: string) {
    const destinationPart = trainLineName.split(" - ")[0] ?? "";
    return removeStationSuffix(destinationPart.replace(/행$/, ""));
}

function removeStationSuffix(stationName: string) {
    return stationName.trim().replace(/역$/, "");
}