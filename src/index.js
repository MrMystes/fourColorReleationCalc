import { buildGraphMatrix } from './buildGraphMatrix';
import { calcFourColorReleation } from './fourColorCaclculate';

const calcReleations = function(coordinates) {
	return calcFourColorReleation(buildGraphMatrix(coordinates));
};

export {
	buildGraphMatrix,
	calcFourColorReleation,
	calcReleations
};


