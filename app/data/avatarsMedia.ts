export const AVATARS_MEDIA_BASE_URL = "https://media.cosmos-universe.com/avatars";

const cdnMedia = (key: string) => `${AVATARS_MEDIA_BASE_URL}/${key}`;


export const AVATARS_MEDIA = {
    alien_avatar: cdnMedia("cosmos_avatar_alien_transparent.png"),
    astronaut_avatar: cdnMedia("cosmos_avatar_astronaut_transparent.png"),
    cat_avatar: cdnMedia("cosmos_avatar_cat_transparent.png"),
    robot_avatar: cdnMedia("cosmos_avatar_robot_transparent.png"),
}
