import _ from 'test/underscore';
import { normalizeSkin } from 'utils/skin';

describe('Skin Customization', function() {

    it('should normalize an empty skin config', function() {
        const skinColors = normalizeSkin({});
        expect(typeof skinColors).to.equal('object');
        expect(_.size(skinColors)).to.equal(4);
    });
});
