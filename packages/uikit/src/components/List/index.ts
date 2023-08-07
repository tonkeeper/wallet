import { List as ListContainer } from './List';
import { ListHeader } from './ListHeader';
import { ListItem } from './ListItem';

export { ListSeparator } from './ListSeparator';

export const List = Object.assign(ListContainer, {
  Header: ListHeader,
  Item: ListItem,
});
