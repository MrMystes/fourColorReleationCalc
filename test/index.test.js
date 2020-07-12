import { calcReleations } from '../dist/bundle';
import coordinates from './coordinates.json';

test("calcReleations; answer's length equal coordinates's length", () => {
    expect(calcReleations(coordinates).length).toEqual(coordinates.length);
})