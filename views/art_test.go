package views

import (
	"strings"
	"testing"
)

func TestArtDirectionCoversActualSourcesAndContexts(t *testing.T) {
	if len(artDirections) != 21 {
		t.Fatal("expected all twenty references and campaign", len(artDirections))
	}
	for _, id := range photoIDs() {
		source := artDirections[id]
		if source.Width <= 0 || source.Height <= 0 || source.Source == "" || source.License == "" || source.Alt == "" {
			t.Fatalf("incomplete source %s", id)
		}
		for _, context := range []ImageContext{ImageCard, ImageDetail, ImageQuick, ImageLine, ImageCompare, ImageStudio, ImageSaved, ImageCollection, ImageEditorial, ImageHero} {
			media := imageMedia(id, context)
			if media.Width != source.Width || media.Height != source.Height || media.Sizes == "" || !strings.Contains(media.Class, "fit-contain") || len(source.Contexts[string(context)].MobileFocal) != 2 {
				t.Fatalf("incomplete context %s/%s", id, context)
			}
			if !strings.Contains(media.Src, "?v=") {
				t.Fatal("source is not fingerprinted", media.Src)
			}
		}
	}
	// These sources expose the old universal 3:4 dimension bug.
	if artDirections["p13"].Width <= artDirections["p13"].Height {
		t.Fatal("landscape reference lost its source orientation")
	}
	if imageMedia("campaign", ImageHero).AVIF == "" {
		t.Fatal("campaign responsive AVIF missing")
	}
}
