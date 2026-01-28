import { isUUID } from 'class-validator';

const invalidUuid = '328c27ee-a932-459a-b6dd-7c9de9782626';
// Change 4dbe (starts with 4) to 8dbe (starts with 8)
const fixedUuid = '3976d01c-8263-4c02-8dbe-921ac61b90ce';

console.log(`Invalid UUID: ${invalidUuid}`);
console.log('isUUID:', isUUID(invalidUuid));
console.log('isUUID(all):', isUUID(invalidUuid, 'all'));

console.log(`\nFixed UUID:   ${fixedUuid}`);
console.log('isUUID:', isUUID(fixedUuid));
console.log('isUUID(4):', isUUID(fixedUuid, '4'));
