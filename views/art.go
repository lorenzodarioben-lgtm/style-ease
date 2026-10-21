package views

import (
	"encoding/json"
	"fmt"
	styleease "github.com/lorenzodarioben-lgtm/style-ease"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
	"strings"
)

type ImageContext string

const (
	ImageCard       ImageContext = "card"
	ImageDetail     ImageContext = "detail"
	ImageQuick      ImageContext = "quick"
	ImageLine       ImageContext = "line"
	ImageCompare    ImageContext = "compare"
	ImageStudio     ImageContext = "studio"
	ImageSaved      ImageContext = "saved"
	ImageCollection ImageContext = "collection"
	ImageEditorial  ImageContext = "editorial"
	ImageHero       ImageContext = "hero"
)

type ArtDirection struct {
	ID, Src, Alt, Subject, Source, License, Orientation string
	Width, Height                                       int
	Sources                                             []struct {
		Path          string
		Width, Height int
	}
	Contexts map[string]struct {
		Fit, Ratio                             string
		DesktopFocal, TabletFocal, MobileFocal []int
		MaxZoom                                float64
		Loading                                string
	}
}

var artDirections = loadArtDirections()

func photoIDs() []string {
	ids := []string{"campaign"}
	for i := 1; i <= 20; i++ {
		ids = append(ids, "p"+n(i))
	}
	return ids
}

func loadArtDirections() map[string]ArtDirection {
	result := map[string]ArtDirection{}
	data, err := styleease.Resources.ReadFile("assets/data/image-art-direction.json")
	if err != nil {
		return result
	}
	var entries []ArtDirection
	if json.Unmarshal(data, &entries) != nil {
		return result
	}
	for _, entry := range entries {
		result[entry.ID] = entry
	}
	return result
}

type Media struct {
	ID, Src, Srcset, AVIF, Alt, Class, Sizes string
	Width, Height                            int
}

func imageMedia(id string, context ImageContext) Media {
	direction, ok := artDirections[id]
	if !ok {
		return Media{ID: id, Src: "/assets/image-unavailable.svg", Alt: "Editorial reference unavailable", Class: "art-media media-" + string(context), Width: 960, Height: 1280, Sizes: "100vw"}
	}
	media := Media{ID: id, Src: assetURL(direction.Src), Alt: direction.Alt, Class: "art-media media-" + string(context) + " photo-" + id, Width: direction.Width, Height: direction.Height}
	fit := direction.Contexts[string(context)].Fit
	if fit != "cover" {
		fit = "contain"
	}
	media.Class += " fit-" + fit
	var sources []string
	for _, source := range direction.Sources {
		sources = append(sources, fmt.Sprintf("%s %dw", assetURL(source.Path), source.Width))
	}
	media.Srcset = strings.Join(sources, ", ")
	switch context {
	case ImageCard:
		media.Sizes = "(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 23vw"
	case ImageLine, ImageCompare, ImageSaved:
		media.Sizes = "(max-width: 600px) 30vw, 220px"
	case ImageStudio:
		media.Sizes = "(max-width: 600px) 44vw, 30vw"
	case ImageHero:
		media.Sizes = "(max-width: 600px) 86vw, 43vw"
	default:
		media.Sizes = "(max-width: 600px) 92vw, 50vw"
	}
	if id == "campaign" {
		media.Srcset = ""
		for _, width := range []int{400, 640, 960, 1600} {
			if media.AVIF != "" {
				media.AVIF += ", "
			}
			media.AVIF += fmt.Sprintf("%s %dw", assetURL(fmt.Sprintf("/assets/images/campaign-%d.avif", width)), width)
		}
	}
	return media
}
func productMedia(p domain.Product, context ImageContext) Media {
	media := imageMedia("p"+n(p.ID), context)
	if _, known := artDirections[media.ID]; !known {
		media.Src = p.Image
		media.Srcset = imageSet(p.Image)
		media.Alt = "Editorial reference for " + p.Name
	}
	return media
}
