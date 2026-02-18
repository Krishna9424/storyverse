import "./StoryCard.css";

export default function StoryCard({
  story,
  onLike,
  navigateToStory,
  navigateToUser
}) {

  const isNew = story.createdAt
    ? Date.now() - story.createdAt < 86400000
    : false;

  return (
    <div className="storycard">

      {/* THUMBNAIL */}
      <div
        className="storycard-thumbnail"
        onClick={() => navigateToStory(story.id)}
      >
        {story.thumbnail ? (
          <img src={story.thumbnail} alt="" />
        ) : (
          <div className="storycard-placeholder" />
        )}

        <div className="storycard-gradient" />

        {isNew && <div className="storycard-new">NEW</div>}

        <div className="storycard-title">
          <h3>{story.title}</h3>
        </div>
      </div>

      {/* FOOTER */}
      <div className="storycard-footer">

        <div
          className="storycard-author"
          onClick={() => navigateToUser(story.authorId)}
        >
          <div className="storycard-avatar">
            {story.authorName?.charAt(0)}
          </div>
          <span>{story.authorName}</span>
        </div>

        <button
          className={`storycard-like ${story.likedByMe ? "liked" : ""}`}
          onClick={() => onLike(story.id)}
        >
          ♥ {story.likesCount || 0}
        </button>

      </div>

    </div>
  );
}
