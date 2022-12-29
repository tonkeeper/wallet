import { ListHeader } from './ListHeader';
import { List as ListContainer } from './List';
import { ListItem } from './ListItem';

export const List = Object.assign(ListContainer, {
  Header: ListHeader,
  Item: ListItem,
});
