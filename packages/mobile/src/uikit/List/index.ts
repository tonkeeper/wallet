import { ListHeader } from './ListHeader';
import { List as ListContainer } from './List';
import { ListItem } from './ListItem';
import { ListItemWithCheckbox } from './ListItemWithCheckbox';

export const List = Object.assign(ListContainer, {
  Header: ListHeader,
  Item: ListItem,
  ItemWithCheckbox: ListItemWithCheckbox,
});
