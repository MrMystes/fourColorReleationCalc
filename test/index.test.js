import coordinates from './coordinates.json';
import { calcReleations } from '../dist'

test("calcReleations; answer's length equal coordinates's length", () => {
   

    // expect(calcReleations(coordinates).length).toEqual(coordinates.length);
})

it('works with promises', () => {
    expect.assertions(1);
    return calcReleations(coordinates).then(answer => expect(answer.length)).toEqual(13)
});



/* 			const dp = function(node, result) {
				if (node.xzjb === 1) {
					result.push(node.code);
				}
				if (node.xzjb < 1) {
					node.childrenList.forEach(inode => {
						dp(inode, result);
					});
				}
				return result;
			};
			const regionCodes = dp(regions, []);
			console.log('regionCodes', regionCodes);

			const all = regionCodes.map(code => {
				return fetch(`https://dolphin-dev.kedacom.com/search-server/area/base/queryByAdcode?adcode=${code}&containsSon=false`)
				.then(res => res.json())
				.then(res => {
					if (res.message) return [];
					let { result: { polyline: { coordinates, type } } } = res;
					if (type === 'Polygon') {
						return coordinates;
					}
					if (coordinates.length > 1) {
						coordinates.sort((a, b) => b[0].length - a[0].length);
						return coordinates[0];
					}
				});
			});
			let coordinates = await Promise.all(all);
			console.log('coordinates', coordinates);
			var urlObject = window.URL || window.webkitURL || window;
			var export_blob = new Blob([JSON.stringify(coordinates)]);
			var save_link = document.createElement('a');
			save_link.href = urlObject.createObjectURL(export_blob);
			save_link.download = 'coordinates.json';
			save_link.click(); */