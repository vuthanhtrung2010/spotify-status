document.addEventListener("DOMContentLoaded", function () {
  const progressBarFill = document.querySelector(".progress-bar-fill");

  let isCurrentlyPlaying = false; // Variable to track if a track is currently playing

  // Function to fetch status data from the server
  const fetchStatusData = async () => {
    try {
      const response = await fetch("/status-data");
      const data = await response.json();

      // Process the received data and update the UI
      updateUI(data);
    } catch (error) {
      console.error("Error fetching status data:", error);
    }
  };

  // Function to update the UI with the received status data
  const updateUI = (data) => {
    const status = data.status;
    if (
      !status ||
      !status.body ||
      !status.body.is_playing ||
      status.body.currently_playing_type === "ad"
    ) {
      // If not playing or no status data available, update UI accordingly
      if (isCurrentlyPlaying) {
        const statusContainer = document.querySelector(".status");
        if (statusContainer) {
          statusContainer.innerHTML = "<p>Currently not playing any track.</p>";
        }
        isCurrentlyPlaying = false;
      }
      return;
    }

    isCurrentlyPlaying = true;

    const components = ["track-image", "album-name", "artists"];

    // Function to check if all components exist
    const checkComponentsExistence = () => {
      return components.every((component) =>
        document.querySelector(`.${component}`),
      );
    };

    // Function to reload the page if any component is missing
    const reloadIfComponentsMissing = () => {
      if (!checkComponentsExistence()) {
        window.location.reload();
      }
    };

    // Run it fr
    reloadIfComponentsMissing();
    const track = status.body.item;
    const artists = (track.artists || []).map((artist) => {
      return {
        name: artist.name,
        link: `https://open.spotify.com/artist/${artist.id}`,
      };
    });

    // Update track image
    const trackImage = document.querySelector(".track-image");
    if (trackImage) {
      trackImage.src = track.album.images[0].url;
    }

    // Update track name
    const trackName = document.querySelector("h2");
    if (trackName) {
      const trackLink = document.createElement("a");
      trackLink.href = track.external_urls.spotify;
      trackLink.textContent = track.name;
      trackLink.style.color = "white"; // Set text color to white
      trackLink.style.textDecoration = "none"; // Remove underline by default
      trackLink.style.transition = "color 0.3s, text-decoration 0.3s"; // Add transition effect for color and text-decoration
      trackLink.addEventListener("mouseover", () => {
        trackLink.style.textDecoration = "underline"; // Underline on hover
      });
      trackLink.addEventListener("mouseout", () => {
        trackLink.style.textDecoration = "none"; // Remove underline on mouseout
      });
      trackName.innerHTML = ""; // Clear existing content
      trackName.appendChild(trackLink); // Append the anchor tag to the h2 element
    }

    // Update album name
    const album = track.album;
    const albumLink = album
      ? `https://open.spotify.com/album/${album.id}`
      : "#";

    const albumName = document.querySelector(".album-name");
    if (albumName) {
      albumName.innerHTML = `on <a href="${albumLink}">${track.album.name}</a>`;
    }

    // Update artists names
    const artistsList = document.querySelector(".artists");
    if (artistsList) {
      artistsList.innerHTML = artists
        .map((artist) => `<a href="${artist.link}">${artist.name}</a>`)
        .join(", ");
    }

    const currentProgress = status.body.progress_ms || 0;
    const trackDuration = track.duration_ms || 1; // Prevent division by zero

    const progressPercent = (currentProgress / trackDuration) * 100;

    // Update the progress bar width
    if (progressBarFill) {
      progressBarFill.style.width = `${progressPercent}%`;
    }

    // Update other UI elements as needed
    const endTime = document.getElementById("end-time");
    if (endTime) {
      const remainingTime = calculateRemainingTime(
        currentProgress,
        trackDuration,
      );
      endTime.innerText = remainingTime;
    }
  };

  // Function to calculate remaining time
  const calculateRemainingTime = (currentProgress, trackDuration) => {
    const minutes = Math.floor(trackDuration / 60000);
    const seconds = Math.floor((trackDuration % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Fetch status data initially when the page loads
  fetchStatusData();

  // Periodically fetch status data every second
  setInterval(fetchStatusData, 1000);
});
