import AsyncStorage from '@react-native-async-storage/async-storage';

class EventIdService {
  private readonly eventIdStoreKey = 'ton-connect-service-event-id';

  private eventId: number = 0;

  constructor() {
    AsyncStorage.getItem(this.eventIdStoreKey)
      .then((value) => {
        this.eventId = Number(value);
      })
      .catch(() => {});
  }

  public getId() {
    this.eventId++;

    AsyncStorage.setItem(this.eventIdStoreKey, String(this.eventId)).catch(() => {});

    return this.eventId;
  }
}

export const TCEventID = new EventIdService();
