import { parseTonLink } from '../parseTonLink';

test('test parseTonLink', () => {
  expect(
    parseTonLink('ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'),
  ).toEqual({
    match: true,
    address: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
    operation: 'transfer',
    query: {},
  });

  expect(
    parseTonLink(
      'ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000&text=data',
    ),
  ).toEqual({
    match: true,
    address: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
    operation: 'transfer',
    query: {
      amount: '1000000000',
      text: 'data',
    },
  });

  expect(
    parseTonLink(
      'ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000',
    ),
  ).toEqual({
    match: true,
    address: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
    operation: 'transfer',
    query: {
      amount: '1000000000',
    },
  });

  expect(
    parseTonLink(
      'https://tonhub.com/transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000',
    ),
  ).toEqual({
    match: true,
    address: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
    operation: 'transfer',
    query: {
      amount: '1000000000',
    },
  });

  expect(parseTonLink('ton://transfer/addr?text=xxx')).toEqual({
    match: true,
    address: 'addr',
    operation: 'transfer',
    query: {
      text: 'xxx',
    },
  });

  expect(parseTonLink('ton://test')).toEqual({
    match: true,
    address: '',
    operation: 'test',
    query: {},
  });

  expect(parseTonLink('test')).toEqual({
    match: false,
    address: '',
    operation: '',
    query: {},
  });

  expect(parseTonLink('')).toEqual({
    match: false,
    address: '',
    operation: '',
    query: {},
  });
});
