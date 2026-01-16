

export abstract class NotificationProvider {
    abstract sendNotification(content: Record<string, any>): Promise<void>;

}