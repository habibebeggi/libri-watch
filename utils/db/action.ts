import {db} from "./dbConfig";
import { Users, Books, Movies, ReadingList, WatchingList, Notifications, Transactions, Rewards} from "./schema";
import {eq, sql, and, desc, ne, not} from "drizzle-orm";

export async function createUser(email:string, name: string) {
    try{
        const [user] = await db.insert(Users).values({email, name}).returning().execute();
        return user;
    } catch(error){
        console.error(`Kullanıcı oluşturulamadı! Hata: ${error}`);
        return null;
    }
}

export async function checkIfUserExists(email: string) {
    try{
        const existingUser = await db.select().from(Users).where(eq(Users.email, email)).execute();
        return existingUser.length > 0;
    } catch(error){
        console.error(`Kullanıcı kontrol edilirken hata oluştu! Hata: ${error}`);
        return false;
    }
}

export async function updateUserByEmail(email:string, {name, avatar}:{name:string; avatar: string | null}) {
    try{
        const updatedUser = await db.update(Users).set({name, avatar}).where(eq(Users.email, email)).returning();
        return updatedUser[0];
    }catch(error){
        console.error(`Kullanıcı güncellenirken hata oluştu! Hata: ${error} `);
        throw new Error("Güncelleme işlemi başarısız oldu!");
    }
}

export async function getUserByEmail(email: string) {
    try{
        const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
        return user;
    } catch(error){
        console.error("Kullanıcı e-postayla alınırken hata oluştu! Hata: ", error);
        return null;
    }
}

export async function deleteUser(email: string) {
    const user = await db.select().from(Users).where(eq(Users.email, email)).limit(1).execute();
    if(user.length === 0){
        console.error("Kullanıcı bulunamadı!");
        return false;
    }

    const userId = user[0].id;

    try{
        await db.delete(ReadingList).where(eq(ReadingList.userId, userId)).execute();
        await db.delete(WatchingList).where(eq(WatchingList.userId, userId)).execute();
        await db.delete(Rewards).where(eq(Rewards.userId, userId)).execute();
        await db.delete(Notifications).where(eq(Notifications.userId, userId)).execute();
        await db.delete(Transactions).where(eq(Transactions.userId, userId)).execute();
        
        const deleteUserResult = await db.delete(Users).where(eq(Users.id, userId)).execute();
        if(!deleteUserResult){
            console.error("Hata! Kullanıcı silinemedi!");
            return false;
        }
        console.log("Kullanıcı ve ilişkili olduğu tüm veriler başarıyla silindi!");
        return true;

    } catch(error) {
    console.error(`Hesap silinemedi! Hata: ${error}`);
    return false;
    }
}

export async function addBooks(title: string, isbn: string, author: string, coverImage: string, publishedYear: string, status:string ) {
    try{
        const newBook = await db.insert(Books).values({
            title,
            isbn,
            author,
            coverImage,
            publishedYear,
            createdAt: new Date(),
            status: "unread" 
        }).returning();
        return newBook;
    }catch(error){
        console.error(`Kitap eklenemedi! Hata: ${error}`);
        return null;
    }
}

export async function  addMovies(title:string, type: string, posterImage: string, releaseYear:string, overview: string, status: string ) {
    try{
        const newMovie = await db.insert(Movies).values({
            title,
            type, 
            posterImage,
            releaseYear, 
            overview,
            createdAt: new Date(),
            status: "unwatched"
        }).returning();
        return newMovie;
    }catch(error){
        console.error(`İçerik eklenemedi! Hata: ${error}`);
        return null;
    }
}

export async function updateContentStatus (contentId: number, status: string, contentType: 'movie' | 'book') {
    try{
        let updatedContent;
        if(contentType === 'movie'){
            [updatedContent] = await db.update(Movies).set({status}).where(eq(Movies.id, contentId)).returning().execute();
        } else if(contentType === 'book'){
            [updatedContent] = await db.update(Books).set({status}).where(eq(Books.id, contentId)).returning().execute();
        }
        return updatedContent;
    }catch(error){
        console.error(`İçerik durumu güncellenirken hata oluştu! Hata :${error}`);
        return null;
    }
}

export async function createReadingList(
    userId: number,
    bookId: number,
    title: string,
    status: string
){
    try{
        const [readingList] = await db.insert(ReadingList).values({
            userId, bookId, title, status: "uncompleted",
        }).returning().execute();

       return readingList;
    } catch(error){
        console.error(`Okunacaklar listesi oluşturulurken hata oluştu! Hata: ${error}`);
        return null;
    }
}


export async function createWatchingList(
    userId: number,
    movieId: number,
    title: string,
    status: string,
) {
    try{
        const [watchingList] = await db.insert(WatchingList).values({
            userId, movieId, title, status:"uncompleted",
        }).returning().execute();
        return watchingList;
    }catch(error){
        console.error(`İzlenecekler listesi oluşturulurken hata oluştu! Hata: ${error}`);
        return null;
    }
}

export async function updateListStatus(listId: number, status: string, listType: 'watching' | 'reading') {
    try{
        let updatedList;
        if(listType === 'watching'){
            [updatedList] = await db.update(WatchingList).set({status}).where(eq(WatchingList.id, listId)).returning().execute();
        }else if(listType === 'reading'){
            [updatedList] = await db.update(ReadingList).set({status}).where(eq(ReadingList.id, listId)).returning().execute();
        }

        return updatedList;
    }catch(error){
        console.error(`Liste durumu güncellenirken hata oluştu! Hata: ${error}`);
        return null;
    }
}

export async function getAllReadingListByUser(userId: number) {
    try{
        return await db.select().from(ReadingList).where(eq(ReadingList.userId, userId)).execute();
    }catch(error){
        console.error(`Kullanıcıya ait okuma listeleri getirilirken hata oluştu! Hata: ${error}`);
        return [];
    }
}

export async function  getAllWatchingListByUser(userId:number) {
    try{
        return await db.select().from(WatchingList).where(eq(WatchingList.userId, userId)).execute();
    }catch(error){
        console.error(`Kullanıcıya ait izleme listeleri getirilirken hata oluştu! Hata: ${error}`);
        return [];
    }
}

export async function createNotification(userId: number, message: string, type: string) {
    try{
        const [notification] = await db.insert(Notifications).values({userId, message, type}).returning().execute();
        return notification;
    }catch(error){
        console.error(`Okunmamış bildirimler alınırken hata oluştu! Hata: ${error}`);
        return [];
    }
}

export async function getUnreadNotifications(userId: number) {
    try{
        return await db.select().from(Notifications).where(and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))).execute();
    }catch(error){
        console.error(`Okunmamış bildirimler alınırken hata oluştu! Hata: ${error}`);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: number) {
    try{
        await db.update(Notifications).set({isRead: true}).where(eq(Notifications.id, notificationId)).execute();
    }catch(error){
        console.error(`Bildirim okundu olarak işaretlenemedi! Hata: ${error}`);
    }
}

export async function getUnreadBooks(userId:number){
    try{
        const unreads = await db
        .select({
            bookId: ReadingList.bookId,
            title: Books.title,
            author: Books.author,
            status: Books.status,
            coverImage: Books.coverImage,
        })
        .from(ReadingList)
        .leftJoin(Books, eq(ReadingList.bookId, Books.id))
        .where(and(eq(ReadingList.userId, userId), eq(Books.status, "unread")))
        .execute();

        return unreads.map((unreads: any)=>({ ...unreads,}))
    }catch(error){
        console.error(`Kullanıcıya ait okunmamış kitap bilgileri getirilirken hata oluştu! Hata:${error}`);
        return [];
    }
}


export async function getRecentContents( contentType: 'book' | 'movie' , limit: number = 20) {
    try{
        let recentContent; 
        if(contentType === 'book'){
            recentContent = await db.select().from(Books).orderBy(desc(Books.createdAt)).limit(limit).execute();
        } else if(contentType === 'movie'){
            recentContent  =await db.select().from(Movies).orderBy(desc(Movies.createdAt)).limit(limit).execute();
        }

        return recentContent?.map(content =>({
            ...content, date: content.createdAt?.toISOString().split('T')[0]
        }));

    }catch(error){
        console.error(`Son içerikler getirilemedi! Hata: ${error}`);
        return [];
    }
}

export async function saveReward(userId:number, amount: number) {
    try{
        const existReward = await db.select().from(Rewards).where(and(eq(Rewards.userId, userId), eq(Rewards.name, "İçerik Tamamlama Ödülü"))).execute();
        if(existReward.length> 0){
            return existReward[0];
        }

        const [reward] = await db.insert(Rewards).values({
            userId,
            name: "İçerik Tamamlama Ödülü",
            description: "İçerik tamamlamadan kazandığınız puanlar",
            points: amount,
            level: 1,
            isAvailable: true,
        })
        .returning()
        .execute();

        await createTransaction(userId, 'earned_completed', amount, 'İçerik tamamlamadan kazanılan puanlar');
        return reward;
    }catch(error){
        console.error(`Ödül kaydedilirken hata oluştu! Hata: ${error}`);
        throw error;
    }
}

export async function saveNotificationReward(userId: number, amount: number) {
    try{
        const [reward] = await db.insert(Rewards).values({
            userId,
            name: "İçerik tamamlama ödül",
            description: "içerik tamamladıgınız için kazandıgınız odul",
            points: amount,
            level:1,
            isAvailable: true,
        }).returning().execute();

        await createTransaction(userId, 'earned_completed', amount, 'İçerikleri tamamladıgınız şçşn kazandıgınız oduller');
        return reward;
    }catch(error){
        console.error(`İçerik tamamlama ödülü kaydedilemedi! Hata: ${error}`);
        throw error;
    }
}

export async function getAllRewards() {
    try{
        const rewards  =await db.select({
            id: Rewards.id,
            userId: Rewards.userId,
            points: Rewards.points,
            level: Rewards.level,
            createdAt
        })
    }
}
