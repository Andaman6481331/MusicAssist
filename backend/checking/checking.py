import torchaudio
import torch

# Load pre-trained model (GTZAN genre classification)
model = torch.hub.load('harritaylor/torchvggish', 'vggish')
model.eval()

# Load wav
waveform, sr = torchaudio.load("Test1226(1).wav")
if sr != 16000:
    waveform = torchaudio.functional.resample(waveform, sr, 16000)

# Extract embeddings
embeddings = model.forward(waveform)

# Then feed embeddings into a genre classifier (you can train or use a pre-trained one)
