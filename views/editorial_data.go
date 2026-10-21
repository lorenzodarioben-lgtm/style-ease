package views

import "github.com/lorenzodarioben-lgtm/style-ease/internal/domain"

// Journal content is authored presentation data. Catalogue membership, variants,
// stock and every commerce operation continue to come from PostgreSQL.
type Chapter struct {
	ID, Title  string
	Paragraphs []string
}
type Article struct {
	Slug, Title, Deck, Hero, Kind, Number, ReadTime string
	Chapters                                        []Chapter
	Images                                          []string
	ProductIDs                                      []int
}

func JournalArticles() []Article {
	return []Article{
		{Slug: "the-space-between", Title: "The space between.", Deck: "On proportion, pause, and the quiet work of leaving something out.", Hero: "p7", Kind: "proportion", Number: "01", ReadTime: "4 minute read", Images: []string{"p3", "p2"}, ProductIDs: []int{7, 3, 2}, Chapters: []Chapter{
			{ID: "silhouette", Title: "Begin with the outline", Paragraphs: []string{
				"Before the label, before the detail, there is an outline. A jacket makes a small architecture around the body. A longer trouser draws a line towards the ground. Put the two together and the interval between them becomes as important as either piece on its own.",
				"This is a useful place to begin getting dressed: step back until the details disappear. Look at the relationship between shoulder and hem, volume and length. You do not need a new wardrobe to change that relationship. An open jacket, a tucked shirt, or a different shoe can move the whole composition.",
			}},
			{ID: "interval", Title: "Give the eye somewhere to rest", Paragraphs: []string{
				"Negative space is not an absence of intention. It is what lets an intention be seen. The unbuttoned space at a collar, the clean break above a shoe, the plain surface beside a textured knit: each gives the eye a moment before the next detail.",
				"Try choosing one point of emphasis and allowing everything around it to be quieter. If the jacket carries the shape, the layer beneath can become a background. If the denim has a generous line, a smaller upper silhouette can make that generosity feel deliberate. These are possibilities, not rules about bodies.",
			}},
			{ID: "movement", Title: "A composition has to move", Paragraphs: []string{
				"One simple exercise is to photograph the same combination twice, once with the outer layer open and once closed. Keep your viewpoint and distance consistent. The change in outline will be easier to read when the surrounding frame stays still. Then put the camera away and judge the comfort for yourself.",
				"A still photograph can suggest a proportion; it cannot tell you how clothing feels over a whole day. Sit down, walk, reach, and notice where the shape changes. The most interesting outline is not always the one that stays perfectly in place.",
				"Use the references here as starting points for looking. The photographs are editorial references, rather than proof of a particular sample variant or fit. In the collection, compare the listed materials and options, then bring a few pieces into Style Studio. Leave a space, replace one thing, and look again.",
			}},
		}},
		{Slug: "colour-when-it-counts", Title: "Colour, when it counts.", Deck: "A green knit, a blue sky, a change in temperature. Let one colour set the mood.", Hero: "p6", Kind: "colour", Number: "02", ReadTime: "4 minute read", Images: []string{"p8", "p20"}, ProductIDs: []int{6, 8, 20}, Chapters: []Chapter{
			{ID: "notice", Title: "First, notice the colour", Paragraphs: []string{
				"Monochrome makes it easy to see an outline. Colour brings another kind of information: temperature, association, a memory of light. A green knit against a blue sky is not simply a green object. The sky changes how the knit feels, and the knit gives the sky something to answer.",
				"On this page the photographs stay in their original colour. There is no simulated dye, no generated variant, and no promise that the image matches every option in the catalogue. It is an invitation to look at the actual reference before choosing a sample colour.",
			}},
			{ID: "temperature", Title: "Think in temperature", Paragraphs: []string{
				"A palette does not have to begin with matching. Warm brown can make a cool blue feel clearer. A muted green can sit beside an off-white without either disappearing. The useful question is what each colour does to the one next to it.",
				"Build a small experiment. Start with the colour that draws your eye, then place two quieter pieces beside it. Change just one of those pieces. That small constraint makes it easier to see the difference. You are composing a relationship, not collecting as many shades as possible.",
			}},
			{ID: "repeat", Title: "Let a small note repeat", Paragraphs: []string{
				"Keep a colour note over a few days: a wall on your walk, a book cover, a particular afternoon sky. Notice which combinations you return to. A personal palette can begin with attention to ordinary surroundings, rather than a prescribed seasonal list. Translate the relationship loosely, with the clothes already available to you.",
				"Repetition can bring a palette together without making it uniform. A dark shoe may echo the depth of a bag. A pale layer can pick up a highlight elsewhere. The echo does not need to be exact; a little distance keeps the composition alive.",
				"When you return to the shop, the photographs begin in monochrome and reveal their original colour on focus, hover, or an explicit touch control. Use both ways of seeing. One helps you notice the structure; the other lets the reference have its own atmosphere. The final choice is yours to make.",
			}},
		}},
		{Slug: "a-small-point-of-difference", Title: "A small point of difference.", Deck: "Objects, texture, and the details that change an otherwise familiar outfit.", Hero: "p18", Kind: "objects", Number: "03", ReadTime: "4 minute read", Images: []string{"p16", "p19"}, ProductIDs: []int{18, 16, 17, 19}, Chapters: []Chapter{
			{ID: "object", Title: "An object, considered", Paragraphs: []string{
				"A small object can alter the balance of an entire outfit. A bag introduces a second shape beside the body. A bracelet catches a brief line of light. A wallet, mostly unseen, changes the experience of reaching for an everyday thing. Scale does not determine significance.",
				"The still life asks for a different pace of looking from the fashion portrait. There is no gesture to read, so the eye follows an edge, a curve, the meeting of surfaces. In the references here, the whole object remains in frame. The space around it is part of the photograph.",
			}},
			{ID: "texture", Title: "Texture creates a conversation", Paragraphs: []string{
				"A woven surface beside smooth cloth creates a contrast you can see before you could touch it. A reflective detail interrupts a matte silhouette. These differences can make familiar pieces feel newly considered, without asking every part of the outfit to announce itself.",
				"Read photographs as evidence of the photograph itself. Lighting can intensify a texture and a close view can make an object seem larger than it is. The sample catalogue supplies its own material information and options; the image is a reference, not a substitute for a product specification.",
			}},
			{ID: "enough", Title: "Know when there is enough", Paragraphs: []string{
				"For a useful comparison, set two possible finishing objects beside the same outfit, one at a time. Keep the rest of the composition unchanged. Look for the difference in scale, surface and emphasis. A photograph of each arrangement can help you see a relationship that is less obvious when the objects are side by side.",
				"Try adding one object, then taking it away. Notice whether the outfit becomes clearer or simply quieter. A finishing detail earns its place through the relationship it makes, not because an outfit is supposed to contain a certain number of accessories.",
				"The Objects of Interest edit is a place to make that experiment. Compare a few pieces, save an exact sample variant, or place one beside a look in the studio. Sometimes the smallest change provides the clearest answer. Sometimes the right finishing touch is the space you decide to keep.",
			}},
		}},
	}
}
func ArticleBySlug(slug string) (Article, bool) {
	for _, a := range JournalArticles() {
		if a.Slug == slug {
			return a, true
		}
	}
	return Article{}, false
}
func LegacyArticle(slug string) string {
	return map[string]string{"structure": "the-space-between", "everyday": "colour-when-it-counts", "objects": "a-small-point-of-difference"}[slug]
}
func collectionCover(slug string) string {
	return map[string]string{"structure": "p7", "everyday": "p6", "objects": "p16"}[slug]
}
func editCount(m Model, slug string) int {
	n := 0
	for _, p := range m.Products {
		for _, membership := range p.Collections {
			if membership == slug {
				n++
				break
			}
		}
	}
	return n
}
func articleProducts(m Model) []domain.Product {
	var out []domain.Product
	for _, id := range m.Article.ProductIDs {
		for _, p := range m.Products {
			if p.ID == id {
				out = append(out, p)
				break
			}
		}
	}
	return out
}

func pageDescription(title string) string {
	for _, a := range JournalArticles() {
		if title == a.Title {
			return a.Deck + " An authored Style Ease visual essay."
		}
	}
	switch title {
	case "Editorial: ways of looking":
		return "The Style Ease journal. Three visual essays on proportion, original colour and the objects that change an outfit."
	case "Collections: shop the edit":
		return "Shop three considered Style Ease edits: Structure, Everyday and Objects of Interest. Explore real sample catalogue pieces."
	}
	return "A considered wardrobe. Explore the Style Ease concept collection, compare pieces and compose a look. A demonstration by Lorenzo Ben."
}
